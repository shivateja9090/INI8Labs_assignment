from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.http import FileResponse, Http404
from django.conf import settings
from .models import Document
from .serializers import DocumentSerializer
import os

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class DocumentUploadView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        patient_id = request.data.get('patient_id')
        if not file or not patient_id:
            return Response({'error': 'File and patient_id are required.'}, status=400)
        if file.content_type != 'application/pdf':
            return Response({'error': 'Only PDF files are allowed.'}, status=400)
        if file.size > MAX_FILE_SIZE:
            return Response({'error': 'File size exceeds 10MB limit.'}, status=400)
        document = Document.objects.create(
            file=file,
            filename=file.name,
            patient_id=patient_id,
            file_size=file.size
        )
        serializer = self.get_serializer(document)
        return Response(serializer.data, status=201)

class DocumentListView(generics.ListAPIView):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer

class DocumentDownloadView(APIView):
    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            raise Http404
        file_path = document.file.path
        if not os.path.exists(file_path):
            raise Http404
        response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename=document.filename)
        return response

class DocumentDeleteView(APIView):
    def delete(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=404)
        document.file.delete(save=False)
        document.delete()
        return Response({'success': True})
