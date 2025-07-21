from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Document
from django.core.files.uploadedfile import SimpleUploadedFile
import io

# Create your tests here.

class DocumentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.upload_url = reverse('document-upload')
        self.list_url = reverse('document-list')

    def test_upload_only_pdf_allowed(self):
        txt_file = SimpleUploadedFile('test.txt', b'hello', content_type='text/plain')
        response = self.client.post(self.upload_url, {'file': txt_file, 'patient_id': 'p1'}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Only PDF files are allowed', str(response.data))

    def test_upload_and_metadata_storage(self):
        pdf_file = SimpleUploadedFile('test.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        response = self.client.post(self.upload_url, {'file': pdf_file, 'patient_id': 'p2'}, format='multipart')
        self.assertEqual(response.status_code, 201)
        doc = Document.objects.get(filename='test.pdf')
        self.assertEqual(doc.patient_id, 'p2')
        self.assertEqual(doc.file_size, len(b'%PDF-1.4 test'))

    def test_delete_document(self):
        pdf_file = SimpleUploadedFile('del.pdf', b'%PDF-1.4 test', content_type='application/pdf')
        upload_resp = self.client.post(self.upload_url, {'file': pdf_file, 'patient_id': 'p3'}, format='multipart')
        doc_id = upload_resp.data['id']
        delete_url = reverse('document-delete', args=[doc_id])
        del_resp = self.client.delete(delete_url)
        self.assertEqual(del_resp.status_code, 200)
        self.assertFalse(Document.objects.filter(id=doc_id).exists())
