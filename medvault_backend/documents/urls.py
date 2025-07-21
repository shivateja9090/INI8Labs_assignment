from django.urls import path
from .views import DocumentUploadView, DocumentListView, DocumentDownloadView, DocumentDeleteView

urlpatterns = [
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('', DocumentListView.as_view(), name='document-list'),
    path('<int:pk>/download/', DocumentDownloadView.as_view(), name='document-download'),
    path('<int:pk>/', DocumentDeleteView.as_view(), name='document-delete'),
] 