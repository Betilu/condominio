import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Eye, User, Phone, Mail, Calendar, FileText, Camera } from 'lucide-react';
import FaceRecognitionCamera from '../../components/FaceRecognitionCamera';
import toast from 'react-hot-toast';

const Visitors = () => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    document_type: 'id',
    document_number: '',
    phone: '',
    email: '',
    photo: null,
    is_blacklisted: false,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await securityService.getVisitors({ page_size: 1000 });
      setVisitors(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      // Agregar campos de texto
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('document_type', formData.document_type);
      submitData.append('document_number', formData.document_number);
      submitData.append('phone', formData.phone || '');
      submitData.append('email', formData.email || '');
      submitData.append('is_blacklisted', formData.is_blacklisted.toString());
      submitData.append('notes', formData.notes || '');
      
      // Agregar foto si existe y es un archivo válido
      console.log('=== VERIFICANDO FOTO ===');
      console.log('formData.photo:', formData.photo);
      console.log('Tipo:', typeof formData.photo);
      console.log('Es File:', formData.photo instanceof File);
      
      if (formData.photo && formData.photo instanceof File && formData.photo.size > 0) {
        console.log('✅ Archivo válido encontrado');
        console.log('Nombre:', formData.photo.name);
        console.log('Tamaño:', formData.photo.size);
        console.log('Tipo MIME:', formData.photo.type);
        
        submitData.append('photo', formData.photo);
        console.log('✅ Foto agregada al FormData');
      } else {
        console.log('❌ No se enviará foto - archivo no válido o vacío');
      }

      console.log('=== CONTENIDO FINAL DEL FORMDATA ===');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }

      let visitorResponse;
      if (editingVisitor) {
        visitorResponse = await securityService.updateVisitor(editingVisitor.id, submitData);
        toast.success('Visitante actualizado exitosamente');
      } else {
        visitorResponse = await securityService.createVisitor(submitData);
        toast.success('Visitante creado exitosamente');
      }
      
      // Si se subió una foto, registrar la codificación facial
      if (formData.photo && visitorResponse.data) {
        try {
          const visitorId = visitorResponse.data.id;
          console.log('🔍 Registrando codificación facial para visitante ID:', visitorId);
          
          const imageData = await convertFileToBase64(formData.photo);
          console.log('📸 Imagen convertida a base64, tamaño:', imageData.length);
          
          const faceResponse = await securityService.registerFace({
            visitor_id: visitorId,
            image_data: imageData
          });
          
          console.log('✅ Codificación facial registrada exitosamente:', faceResponse.data);
          toast.success('Codificación facial registrada exitosamente');
        } catch (faceError) {
          console.error('❌ Error registrando codificación facial:', faceError);
          console.error('Error response:', faceError.response?.data);
          toast.error(`Error registrando codificación facial: ${faceError.response?.data?.error || faceError.message}`);
        }
      } else {
        console.log('ℹ️ No se registró codificación facial - no hay foto o respuesta inválida');
      }
      
      // Actualizar la lista y cerrar modal
      await fetchData();
      setShowModal(false);
      setEditingVisitor(null);
      resetForm();
      
    } catch (error) {
      console.error('Error saving visitor:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (visitor) => {
    setEditingVisitor(visitor);
    setFormData({
      first_name: visitor.first_name || '',
      last_name: visitor.last_name || '',
      document_type: visitor.document_type || 'id',
      document_number: visitor.document_number || '',
      phone: visitor.phone || '',
      email: visitor.email || '',
      photo: null, // Nueva foto (opcional)
      is_blacklisted: visitor.is_blacklisted || false,
      notes: visitor.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este visitante?')) {
      try {
        await securityService.deleteVisitor(id);
        toast.success('Visitante eliminado exitosamente');
        await fetchData();
      } catch (error) {
        console.error('Error deleting visitor:', error);
        toast.error(`Error eliminando visitante: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      document_type: 'id',
      document_number: '',
      phone: '',
      email: '',
      photo: null,
      is_blacklisted: false,
      notes: ''
    });
  };

  const handleCameraCapture = (imageData) => {
    // Convertir base64 a File
    const byteCharacters = atob(imageData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
    
    setFormData(prev => ({
      ...prev,
      photo: file
    }));
    
    setShowCamera(false);
  };

  const handleStartCamera = () => {
    setShowCamera(true);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDocument = !documentFilter || visitor.document_type === documentFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'blacklisted' && visitor.is_blacklisted) ||
                         (statusFilter === 'active' && !visitor.is_blacklisted);
    
    return matchesSearch && matchesDocument && matchesStatus;
  });

  const getDocumentTypeText = (type) => {
    switch (type) {
      case 'id': return 'Cédula';
      case 'passport': return 'Pasaporte';
      case 'license': return 'Licencia';
      case 'other': return 'Otro';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Visitantes</h1>
          <p className="text-gray-600">Administra la base de datos de visitantes del condominio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Visitante
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Visitantes</p>
              <p className="text-2xl font-bold text-gray-900">{visitors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.filter(v => !v.is_blacklisted).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Reconocimiento</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.filter(v => v.photo_url).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Lista Negra</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.filter(v => v.is_blacklisted).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar visitantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los documentos</option>
              <option value="id">Cédula</option>
              <option value="passport">Pasaporte</option>
              <option value="license">Licencia</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="blacklisted">Lista Negra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {visitor.photo_url ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={visitor.photo_url}
                          alt={`${visitor.first_name} ${visitor.last_name}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {visitor.first_name} {visitor.last_name}
                        </div>
                        <div className="flex items-center mt-1">
                          {visitor.photo_url && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Camera className="h-3 w-3 mr-1" />
                              Reconocimiento
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDocumentTypeText(visitor.document_type)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {visitor.document_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      {visitor.phone && (
                        <>
                          <Phone className="h-4 w-4 mr-1" />
                          {visitor.phone}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      {visitor.email && (
                        <>
                          <Mail className="h-4 w-4 mr-1" />
                          {visitor.email}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      visitor.is_blacklisted 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {visitor.is_blacklisted ? 'Lista Negra' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(visitor.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(visitor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(visitor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingVisitor ? 'Editar Visitante' : 'Nuevo Visitante'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Documento *</label>
                    <select
                      value={formData.document_type}
                      onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="id">Cédula</option>
                      <option value="passport">Pasaporte</option>
                      <option value="license">Licencia</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Documento *</label>
                    <input
                      type="text"
                      value={formData.document_number}
                      onChange={(e) => setFormData({...formData, document_number: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {editingVisitor ? 'Nueva Foto (opcional)' : 'Foto para Reconocimiento Facial'}
                  </label>
                  
                  {/* Mostrar foto existente si está editando */}
                  {editingVisitor && editingVisitor.photo_url && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-2">Foto actual:</p>
                      <img
                        src={editingVisitor.photo_url}
                        alt="Foto actual"
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Mostrar foto seleccionada/capturada */}
                  {formData.photo && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Foto seleccionada:</p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={URL.createObjectURL(formData.photo)}
                          alt="Foto seleccionada"
                          className="h-20 w-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, photo: null}))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar foto
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Opciones para capturar/subir foto */}
                  <div className="space-y-3">
                    {/* Botón para tomar foto con cámara */}
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Tomar Foto con Cámara
                    </button>

                    {/* Separador */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">o</span>
                      </div>
                    </div>

                    {/* Input para subir archivo */}
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          console.log('=== ARCHIVO SELECCIONADO ===');
                          console.log('Archivo:', file);
                          console.log('Es File:', file instanceof File);
                          
                          if (file) {
                            console.log('✅ Archivo válido, actualizando estado');
                            setFormData(prev => {
                              const newData = {...prev, photo: file};
                              console.log('Nuevo estado:', newData);
                              return newData;
                            });
                          } else {
                            console.log('❌ No hay archivo seleccionado');
                            setFormData(prev => ({...prev, photo: null}));
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Importante:</strong> La foto se utilizará para el reconocimiento facial. 
                    Asegúrese de que el rostro esté bien iluminado y visible.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_blacklisted"
                    checked={formData.is_blacklisted}
                    onChange={(e) => setFormData({...formData, is_blacklisted: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_blacklisted" className="ml-2 text-sm text-gray-900">
                    Agregar a lista negra
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingVisitor(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingVisitor ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cámara de Reconocimiento Facial */}
      <FaceRecognitionCamera
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
};

export default Visitors;
