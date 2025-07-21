import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, LinearProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Grid
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { API_BASE, MAX_FILE_SIZE } from './constants';

const LOGIN_URL = 'http://localhost:8000/login/';

function App() {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken') || '');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  // Document state
  const [file, setFile] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Axios instance with JWT
  const axiosAuth = axios.create();
  axiosAuth.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Artificial delay to show spinner
      await new Promise(resolve => setTimeout(resolve, 2000));
      const res = await axiosAuth.get(`${API_BASE}/`);
      setDocuments(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch documents', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(LOGIN_URL, loginData);
      setToken(res.data.access);
      localStorage.setItem('jwtToken', res.data.access);
      setSnackbar({ open: true, message: 'Login successful', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Login failed', severity: 'error' });
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('jwtToken');
    setDocuments([]);
    setFile(null);
    setPatientId('');
  };

  // Document handlers
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !patientId) {
      setSnackbar({ open: true, message: 'Select a PDF and enter Patient ID', severity: 'warning' });
      return;
    }
    if (file.type !== 'application/pdf') {
      setSnackbar({ open: true, message: 'Only PDF files allowed', severity: 'error' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSnackbar({ open: true, message: 'File size exceeds 10MB', severity: 'error' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    setLoading(true);
    setProgress(0);
    try {
      await axiosAuth.post(`${API_BASE}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      setSnackbar({ open: true, message: 'Upload successful', severity: 'success' });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setSnackbar({ open: true, message: 'Upload failed', severity: 'error' });
    }
    setLoading(false);
  };

  const handleDownload = async (doc) => {
    try {
      const res = await axiosAuth.get(`${API_BASE}/${doc.id}/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setSnackbar({ open: true, message: 'Download failed', severity: 'error' });
    }
  };

  const handleDelete = async (doc) => {
    try {
      await axiosAuth.delete(`${API_BASE}/${doc.id}/`);
      setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
      fetchDocuments();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  // Login form UI
  if (!token) {
    return (
      <Container maxWidth="xs" sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
          <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 700 }}>
            MedVault Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Username"
              value={loginData.username}
              onChange={e => setLoginData({ ...loginData, username: e.target.value })}
              fullWidth
              margin="normal"
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loginLoading}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // Document manager UI
  return (
    <Container maxWidth="md" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Box>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4 }}>
        MedVault Document Manager
      </Typography>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 700, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={5}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
              disabled={loading}
            >
              Select PDF
              <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Patient ID"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              fullWidth
              disabled={loading || !file || !patientId}
            >
              Upload
            </Button>
          </Grid>
        </Grid>
        {file && <Typography variant="body2" sx={{ mt: 2 }}>Selected: {file.name}</Typography>}
        {loading && <LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={progress} sx={{ mt: 2 }} />}
      </Paper>
      <TableContainer component={Paper} sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Patient ID</TableCell>
              <TableCell>Size (KB)</TableCell>
              <TableCell>Uploaded At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <LinearProgress sx={{ width: '100%' }} />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.filename}</TableCell>
                  <TableCell>{doc.patient_id}</TableCell>
                  <TableCell>{(doc.file_size / 1024).toFixed(2)}</TableCell>
                  <TableCell>{new Date(doc.uploaded_at).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleDownload(doc)}><DownloadIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(doc)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
