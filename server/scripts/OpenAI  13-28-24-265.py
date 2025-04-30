import os
import pandas as pd
from datetime import datetime
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from openai import OpenAI
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
import io
import sys
import json

# Initialize the OpenAI client
client = OpenAI(api_key="API-key")

# Define the folder paths
current_directory = os.path.dirname(os.path.abspath(__file__))
POLICY_FOLDER = os.path.join(current_directory, "..", "uploads", "policy")
EVIDENCE_FOLDER = os.path.join(current_directory, "..", "uploads", "evidence")

PROMPT_TEMPLATE = """
### Subject Analysis: {subject}

You are an IT auditor tasked with evaluating the alignment between the provided evidence and the security controls outlined in the given policy. Your analysis must be methodical, comprehensive, and based solely on the provided data—do **not** make any assumptions beyond what is given.

### Task Description:
Using the provided policy and evidence, produce an audit report that:
- **Documents Matches & Mismatches:** Clearly compare policy requirements with the evidence and note where they align or differ.
- **Identifies Missing Controls:** Highlight any missing configurations or controls.
- **Provides Recommendations:** For every gap you identify, offer actionable, specific recommendations.
- **Summarizes Findings:** Begin with a brief summary of your overall findings before detailing your observations.

### Background & Context:
This task is guided by the principles outlined in DAIR.AI (2024), which emphasize:
- **Clarity & Specificity:** Precisely define tasks and outputs.
- **Contextual Information:** Include necessary background details for an informed analysis.
- **Examples & Constraints:** Adhere to explicit formatting guidelines and limitations, ensuring responses meet the desired criteria.

### Detailed Instructions:
1. **Detailed Observations:**
   - Compare the evidence against the policy requirements, specifically focusing on aspects relevant to {subject}. 
   - **Example**: If {subject} is authentication, assess factors like password policies, multi-factor authentication, and access controls, rather than unrelated elements like storage.
   - If the evidence explicitly states terms like "enabled", "disabled", "true", "false",; or similar, consider this sufficient evidence for the configuration. No further checks or analysis are required for that specific setting, as it is likely a direct reflection of the configuration file.
   - Document both matches and mismatches clearly.
   - Include relevant excerpts from the policy to provide context.
   - Use bullet points or numbered lists for clarity.

2. **Identification of Gaps:**
   - List any missing configurations or controls that are relevant to {subject}.
   - If evidence does not explicitly confirm or deny a requirement, state what additional information is needed for a complete assessment.

3. **Actionable Recommendations:**
   - For each identified gap, provide clear and feasible recommendations that directly relate to the corresponding policy requirement.
   - Avoid vague suggestions—recommend concrete steps, such as configuration changes, additional logging, or policy clarifications.

### Formatting Guidelines:
- **Headings & Subheadings:** Use the provided headings to organize your report.
- **Lists:** Present observations, gaps, and recommendations in bullet points or numbered lists.
- **Style & Tone:** Maintain a formal and objective tone suitable for an IT audit report.

### Input Files:
- **Policy:** {policy_content}
- **Evidence:** {evidence_content}
"""


def extract_text_from_pdf(file_path):
    """Extract text from a PDF."""
    try:
        reader = PdfReader(file_path)
        return "".join(page.extract_text() for page in reader.pages).strip()
    except Exception as e:
        return f"Error reading PDF text: {e}"

def extract_text_from_images_in_pdf(pdf_path):
    """Extract text from images in a PDF using OCR."""
    try:
        pdf_document = fitz.open(pdf_path)
        extracted_text = ""

        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            image_list = page.get_images(full=True)

            for img_index, img in enumerate(image_list, start=1):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                image_bytes = base_image["image"]

                image = Image.open(io.BytesIO(image_bytes))
                text = pytesseract.image_to_string(image)
                extracted_text += f"\n--- Text from Page {page_num + 1}, Image {img_index} ---\n{text}"

        pdf_document.close()
        return extracted_text
    except Exception as e:
        return f"Error extracting images from PDF: {e}"

def process_document(file_path):
    """Process documents (PDF, Excel, or CSV) and extract content."""
    try:
        if file_path.endswith(".pdf"):
            pdf_text = extract_text_from_pdf(file_path)
            ocr_text = extract_text_from_images_in_pdf(file_path)
            return pdf_text + "\n" + ocr_text
        elif file_path.endswith(".csv"):
            return pd.read_csv(file_path).to_string(index=False)
        elif file_path.endswith((".xlsx", ".xls")):
            excel_data = pd.ExcelFile(file_path)
            content = []
            for sheet in excel_data.sheet_names:
                df = excel_data.parse(sheet)
                content.append(f"Sheet: {sheet}\n{df.to_string(index=False)}")
            return "\n\n".join(content)
        else:
            return f"Unsupported file type: {file_path}"
    except Exception as e:
        return f"Error processing file {file_path}: {str(e)}"

def analyze_design(policy_content, evidence_content, subject):
    """Use OpenAI to analyze alignment between policy and evidence."""

    prompt = PROMPT_TEMPLATE.format(
        subject=subject,
        policy_content=policy_content,
        evidence_content=evidence_content
    )
    completion = client.chat.completions.create(
        # model="gpt-3.5-turbo",
        model="gpt-4-turbo-2024-04-09",
        messages=[
            {"role": "system", "content": "You are an IT auditor evaluating control implementation."},
            {"role": "user", "content": prompt},
        ]
    )

    result = completion.choices[0].message.content
    return result

def save_supporting_files(policy_file, evidence_file, policy_content, evidence_content):
    """Save processed policy and evidence content to text files."""
    try:
        policy_output = f"{os.path.splitext(policy_file)[0]}_content.txt"
        evidence_output = f"{os.path.splitext(evidence_file)[0]}_content.txt"

        with open(policy_output, "w", encoding="utf-8") as p_file:
            p_file.write(policy_content)
        with open(evidence_output, "w", encoding="utf-8") as e_file:
            e_file.write(evidence_content)

        return policy_output, evidence_output
    except Exception as e:
        return f"Error saving files: {e}"

def log_metadata(policy_file, evidence_file):
    """Log metadata about the processed files."""
    log_file = "audit_log.txt"
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(log_file, "a") as log:
            log.write(f"{timestamp} - Policy: {policy_file}, Evidence: {evidence_file}\n")
    except Exception as e:
        print(f"Error logging metadata: {e}")

def generate_summary_report(results):
    """Generate a summary report in Excel format."""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"Audit_Summary_Report_{timestamp}.xlsx"
        
        # Format the results into a structured DataFrame with separate columns for each part
        df_results = pd.DataFrame(results, columns=["Policy", "Evidence", "Detailed Observations", "Identification of Gaps", "Actionable Recommendations"])
        
        with pd.ExcelWriter(filename, engine="openpyxl") as writer:
            df_results.to_excel(writer, index=False, sheet_name="Audit Results")
            worksheet = writer.sheets["Audit Results"]
            
            # Header formatting
            header_font = Font(bold=True)
            alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            fill = PatternFill(start_color="D9EAD3", end_color="D9EAD3", fill_type="solid")
            
            # Apply header formatting
            for col in worksheet.iter_cols(min_row=1, max_row=1, min_col=1, max_col=df_results.shape[1]):
                for cell in col:
                    cell.font = header_font
                    cell.alignment = alignment
                    cell.fill = fill

            # Adjust column width based on content length
            for col_num, col in enumerate(worksheet.columns, start=1):
                max_length = 0
                column = col[0].column_letter
                for cell in col:
                    try:
                        max_length = max(max_length, len(str(cell.value)))
                    except:
                        pass
                adjusted_width = (max_length + 2)
                worksheet.column_dimensions[column].width = adjusted_width

            # Apply text wrapping
            for row in worksheet.iter_rows(min_row=2, min_col=1, max_col=df_results.shape[1]):
                for cell in row:
                    cell.alignment = Alignment(wrap_text=True)

        print(f"Summary report saved: {filename}")
    except Exception as e:
        print(f"Error generating summary report: {e}")

def remove_stars_and_numbers(obj):
    if isinstance(obj, dict):
        return {remove_stars_and_numbers(k): remove_stars_and_numbers(v) for k, v in obj.items()}
    
    elif isinstance(obj, list):
        return [remove_stars_and_numbers(item) for item in obj]
    
    elif isinstance(obj, str):
        # Remove stars
        obj = obj.replace('*', '')
        
        obj = re.sub(r'^\d+\.\s*', '', obj) 
        return obj
    
    else:
        return obj

def perform_test_of_design(policy_folder, evidence_folder, subject):
    """Perform the test of design for the provided policies and evidence."""
    policy_files = [os.path.join(policy_folder, f) for f in os.listdir(policy_folder) if f.endswith(".pdf")]
    evidence_files = [os.path.join(evidence_folder, f) for f in os.listdir(evidence_folder) if f.endswith(".pdf")]

    if not policy_files or not evidence_files:
        print("No valid policy or evidence files found.")
        return

    results = []

    for policy_file in policy_files:
        policy_content = process_document(policy_file)
        for evidence_file in evidence_files:
            evidence_content = process_document(evidence_file)

            print(f"Analyzing Policy: {os.path.basename(policy_file)} with Evidence: {os.path.basename(evidence_file)}")
            result = analyze_design(policy_content, evidence_content, subject)

            result_entry = {
                "Policy": os.path.basename(policy_file),
                "Evidence": os.path.basename(evidence_file),
                "Result": result
            }
            results.append(result_entry)

            save_supporting_files(policy_file, evidence_file, policy_content, evidence_content)
            log_metadata(policy_file, evidence_file)

    json_output = json.dumps(results, indent=4, ensure_ascii=False)
    print(json_output)

    generate_summary_report(results)

if __name__ == "__main__":
    subject = sys.argv[0]
    perform_test_of_design(POLICY_FOLDER, EVIDENCE_FOLDER, subject)