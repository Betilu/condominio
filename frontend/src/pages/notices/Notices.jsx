import React, { useState, useEffect } from 'react';
import { noticesService, unitsService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Bell, Calendar, Eye, AlertCircle, Users, Building, Home, FileText, Clock, Target } from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [towers, setTowers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    priority: 'normal',
    audience_scope: 'global',
    target_tower: '',
    target_block: '',
    target_unit: '',
    publish_at: '',
    expire_at: '',
    requires_confirmation: false,
    image: null,
    attachment: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [noticesRes, towersRes, blocksRes, unitsRes] = await Promise.all([
        noticesService.getNotices(),
        unitsService.getTowers(),
        unitsService.getBlocks(),
        unitsService.getUnits()
      ]);
      setNotices(noticesRes.data.results);
      setTowers(towersRes.data.results);
      setBlocks(blocksRes.data.results);
      setUnits(unitsRes.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Crear FormData para manejar archivos
      const formDataToSend = new FormData();
      
      // Agregar campos de texto
      formDataToSend.append('title', formData.title);
      formDataToSend.append('body', formData.body);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('audience_scope', formData.audience_scope);
      formDataToSend.append('publish_at', formData.publish_at || new Date().toISOString());
      if (formData.expire_at) {
        formDataToSend.append('expire_at', formData.expire_at);
      }
      formDataToSend.append('requires_confirmation', formData.requires_confirmation);
      
      // Agregar campos de target
      if (formData.target_tower) {
        formDataToSend.append('target_tower', parseInt(formData.target_tower));
      }
      if (formData.target_block) {
        formDataToSend.append('target_block', parseInt(formData.target_block));
      }
      if (formData.target_unit) {
        formDataToSend.append('target_unit', parseInt(formData.target_unit));
      }
      
      // Agregar archivos si existen
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
      }

      console.log('Enviando datos de aviso:', {
        title: formData.title,
        body: formData.body,
        priority: formData.priority,
        audience_scope: formData.audience_scope,
        hasImage: !!formData.image,
        hasAttachment: !!formData.attachment
      });

      if (editingNotice) {
        await noticesService.updateNotice(editingNotice.id, formDataToSend);
      } else {
        await noticesService.createNotice(formDataToSend);
      }
      fetchData();
      setShowModal(false);
      setEditingNotice(null);
      resetForm();
    } catch (error) {
      console.error('Error saving notice:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || '',
      body: notice.body || '',
      priority: notice.priority || 'normal',
      audience_scope: notice.audience_scope || 'global',
      target_tower: notice.target_tower || '',
      target_block: notice.target_block || '',
      target_unit: notice.target_unit || '',
      publish_at: notice.publish_at ? notice.publish_at.split('T')[0] + 'T' + notice.publish_at.split('T')[1].substring(0, 5) : '',
      expire_at: notice.expire_at ? notice.expire_at.split('T')[0] + 'T' + notice.expire_at.split('T')[1].substring(0, 5) : '',
      requires_confirmation: notice.requires_confirmation || false,
      image: notice.image || null,  // Mantener imagen existente
      attachment: notice.attachment || null  // Mantener archivo existente
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este aviso?')) {
      try {
        await noticesService.deleteNotice(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting notice:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      priority: 'normal',
      audience_scope: 'global',
      target_tower: '',
      target_block: '',
      target_unit: '',
      publish_at: '',
      expire_at: '',
      requires_confirmation: false,
      image: null,
      attachment: null
    });
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.body?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || notice.priority === priorityFilter;
    const matchesAudience = !audienceFilter || notice.audience_scope === audienceFilter;
    return matchesSearch && matchesPriority && matchesAudience;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgente': return 'Urgente';
      case 'alta': return 'Alta';
      case 'normal': return 'Normal';
      case 'baja': return 'Baja';
      default: return priority;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgente': return <AlertCircle className="h-4 w-4" />;
      case 'alta': return <AlertCircle className="h-4 w-4" />;
      case 'normal': return <Bell className="h-4 w-4" />;
      case 'baja': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAudienceScopeText = (scope) => {
    switch (scope) {
      case 'global': return 'Global';
      case 'torre': return 'Torre';
      case 'bloque': return 'Bloque';
      case 'unidad': return 'Unidad';
      case 'propietarios': return 'Propietarios';
      case 'inquilinos': return 'Inquilinos';
      default: return scope;
    }
  };

  const getAudienceScopeIcon = (scope) => {
    switch (scope) {
      case 'global': return <Users className="h-4 w-4" />;
      case 'torre': return <Building className="h-4 w-4" />;
      case 'bloque': return <Building className="h-4 w-4" />;
      case 'unidad': return <Home className="h-4 w-4" />;
      case 'propietarios': return <Users className="h-4 w-4" />;
      case 'inquilinos': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Avisos</h1>
          <p className="text-gray-600">Administra los avisos y comunicaciones del condominio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Aviso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Avisos</p>
              <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(n => n.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(n => n.priority === 'urgente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Confirmación</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(n => n.requires_confirmation).length}
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
                placeholder="Buscar avisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los alcances</option>
              <option value="global">Global</option>
              <option value="torre">Torre</option>
              <option value="bloque">Bloque</option>
              <option value="unidad">Unidad</option>
              <option value="propietarios">Propietarios</option>
              <option value="inquilinos">Inquilinos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start">
                <div className={`p-2 rounded-lg ${getPriorityColor(notice.priority)}`}>
                  {getPriorityIcon(notice.priority)}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{notice.title}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    {getAudienceScopeIcon(notice.audience_scope)}
                    <span className="ml-1">{getAudienceScopeText(notice.audience_scope)}</span>
                    {notice.target_tower_name && (
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        {notice.target_tower_name}
                      </span>
                    )}
                    {notice.target_block_name && (
                      <span className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded">
                        {notice.target_block_name}
                      </span>
                    )}
                    {notice.target_unit_code && (
                      <span className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded">
                        {notice.target_unit_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(notice)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">{notice.body}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {notice.publish_at ? new Date(notice.publish_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{notice.read_rate || 0}% leído</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(notice.priority)}`}>
                  {getPriorityText(notice.priority)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${notice.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {notice.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {notice.requires_confirmation && (
                    <span className="text-xs text-blue-600 font-medium">Requiere confirmación</span>
                  )}
                </div>
              </div>

              {notice.expire_at && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Expira:</span> {new Date(notice.expire_at).toLocaleDateString()}
                </div>
              )}

              {/* Archivos adjuntos */}
              {(notice.image || notice.attachment) && (
                <div className="space-y-1">
                  {notice.image && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-blue-600">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Imagen: {notice.image.split('/').pop()}</span>
                      </div>
                      <a 
                        href={`http://localhost:8000${notice.image}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </a>
                    </div>
                  )}
                  {notice.attachment && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-blue-600">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Archivo: {notice.attachment.split('/').pop()}</span>
                      </div>
                      <a 
                        href={`http://localhost:8000${notice.attachment}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Descargar
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingNotice ? 'Editar Aviso' : 'Nuevo Aviso'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contenido *</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="6"
                    required
                  />
                </div>

                {/* Audience Segmentation */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Segmentación de Audiencia
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alcance</label>
                      <select
                        value={formData.audience_scope}
                        onChange={(e) => setFormData({...formData, audience_scope: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="global">Global</option>
                        <option value="torre">Torre</option>
                        <option value="bloque">Bloque</option>
                        <option value="unidad">Unidad</option>
                        <option value="propietarios">Propietarios</option>
                        <option value="inquilinos">Inquilinos</option>
                      </select>
                    </div>
                    {formData.audience_scope === 'torre' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Torre</label>
                        <select
                          value={formData.target_tower}
                          onChange={(e) => setFormData({...formData, target_tower: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar torre</option>
                          {towers.map(tower => (
                            <option key={tower.id} value={tower.id}>{tower.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {formData.audience_scope === 'bloque' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bloque</label>
                        <select
                          value={formData.target_block}
                          onChange={(e) => setFormData({...formData, target_block: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar bloque</option>
                          {blocks.map(block => (
                            <option key={block.id} value={block.id}>{block.tower_name} - {block.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {formData.audience_scope === 'unidad' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unidad</label>
                        <select
                          value={formData.target_unit}
                          onChange={(e) => setFormData({...formData, target_unit: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar unidad</option>
                          {units.map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.code} - {unit.tower_name} - {unit.block_name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    Programación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha y Hora de Publicación *</label>
                      <input
                        type="datetime-local"
                        value={formData.publish_at}
                        onChange={(e) => setFormData({...formData, publish_at: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha y Hora de Expiración</label>
                      <input
                        type="datetime-local"
                        value={formData.expire_at}
                        onChange={(e) => setFormData({...formData, expire_at: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Archivos Adjuntos
                  </h4>
                  
                  {/* Archivos existentes */}
                  {editingNotice && (editingNotice.image || editingNotice.attachment) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Archivos actuales:</h5>
                      <div className="space-y-2">
                        {editingNotice.image && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Imagen: {editingNotice.image.split('/').pop()}</span>
                            <a 
                              href={`http://localhost:8000${editingNotice.image}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Ver imagen
                            </a>
                          </div>
                        )}
                        {editingNotice.attachment && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Archivo: {editingNotice.attachment.split('/').pop()}</span>
                            <a 
                              href={`http://localhost:8000${editingNotice.attachment}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Descargar
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {editingNotice ? 'Nueva Imagen (opcional)' : 'Imagen'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {editingNotice && (
                        <p className="text-xs text-gray-500 mt-1">
                          Dejar vacío para mantener la imagen actual
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {editingNotice ? 'Nuevo Archivo Adjunto (opcional)' : 'Archivo Adjunto'}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {editingNotice && (
                        <p className="text-xs text-gray-500 mt-1">
                          Dejar vacío para mantener el archivo actual
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Opciones</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requires_confirmation}
                        onChange={(e) => setFormData({...formData, requires_confirmation: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">Requiere confirmación de lectura</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingNotice(null);
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
                    {editingNotice ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
