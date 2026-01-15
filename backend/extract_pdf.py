import PyPDF2

pdf_path = r'c:\Users\DARKO\Desktop\Specifikacija_no_diagram.pdf'
with open(pdf_path, 'rb') as file:
    pdf_reader = PyPDF2.PdfReader(file)
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    print(text)