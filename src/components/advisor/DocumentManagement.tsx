
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Folder,
  File,
  Image,
  Video,
  Archive,
  Star
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  tags: string[];
  uploaded_by: string;
  uploaded_at: string;
  last_accessed?: string;
  access_level: 'public' | 'private' | 'restricted';
  description?: string;
  version?: string;
  is_favorite: boolean;
}

interface DocumentManagementProps {
  advisorId: string;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({ advisorId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [advisorId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      // Simular carga de documentos
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Manual de Operaciones 2024.pdf',
          type: 'pdf',
          size: 2500000,
          category: 'Manuales',
          tags: ['operaciones', 'manual', '2024'],
          uploaded_by: 'Sistema',
          uploaded_at: new Date().toISOString(),
          access_level: 'public',
          description: 'Manual completo de operaciones para restaurantes McDonald\'s',
          version: '2.1',
          is_favorite: true
        },
        {
          id: '2',
          name: 'Contrato Tipo Franquiciado.docx',
          type: 'docx',
          size: 1200000,
          category: 'Contratos',
          tags: ['contrato', 'franquiciado', 'legal'],
          uploaded_by: 'Departamento Legal',
          uploaded_at: new Date(Date.now() - 86400000).toISOString(),
          access_level: 'restricted',
          description: 'Contrato estándar para nuevos franquiciados',
          version: '1.0',
          is_favorite: false
        },
        {
          id: '3',
          name: 'Guía de Seguridad e Higiene.pdf',
          type: 'pdf',
          size: 3100000,
          category: 'Seguridad',
          tags: ['seguridad', 'higiene', 'salud'],
          uploaded_by: 'Departamento de Seguridad',
          uploaded_at: new Date(Date.now() - 172800000).toISOString(),
          access_level: 'public',
          description: 'Guía completa de seguridad e higiene para empleados',
          version: '3.0',
          is_favorite: true
        }
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    const matchesType = typeFilter === 'all' || document.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-6 w-6 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'jpg':
      case 'png':
      case 'gif':
        return <Image className="h-6 w-6 text-pink-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-6 w-6 text-orange-500" />;
      case 'ai':
      case 'psd':
        return <Image className="h-6 w-6 text-indigo-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'public':
        return <Badge className="bg-green-100 text-green-800">Público</Badge>;
      case 'restricted':
        return <Badge className="bg-yellow-100 text-yellow-800">Restringido</Badge>;
      case 'private':
        return <Badge className="bg-red-100 text-red-800">Privado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      
      // Simular subida de archivos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading ${file.name}...`);
        
        // En un caso real, aquí se subiría a Supabase Storage
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setShowUploadModal(false);
      loadDocuments(); // Recargar documentos
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (document: Document) => {
    // Simular descarga
    console.log(`Downloading ${document.name}...`);
    // En un caso real, aquí se descargaría desde Supabase Storage
  };

  const toggleFavorite = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, is_favorite: !doc.is_favorite } : doc
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documentos</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.is_favorite).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Espacio Usado</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatFileSize(documents.reduce((sum, d) => sum + d.size, 0))}
                </p>
              </div>
              <Folder className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(documents.map(d => d.category)).size}
                </p>
              </div>
              <Filter className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Documentos</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {Array.from(new Set(documents.map(d => d.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir Documentos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm truncate">{document.name}</h3>
                        <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(document.id)}
                    >
                      <Star className={`h-4 w-4 ${document.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{document.category}</Badge>
                      {getAccessLevelBadge(document.access_level)}
                    </div>
                    {document.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">{document.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Subido por {document.uploaded_by}</span>
                    <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedDocument(document)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron documentos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de subida de archivos */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Subir Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" disabled={uploading}>
                      {uploading ? 'Subiendo...' : 'Seleccionar Archivos'}
                    </Button>
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                    disabled={uploading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalles del documento */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles del Documento</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                {getFileIcon(selectedDocument.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-600">{selectedDocument.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información del Archivo</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tamaño:</strong> {formatFileSize(selectedDocument.size)}</p>
                    <p><strong>Tipo:</strong> {selectedDocument.type.toUpperCase()}</p>
                    <p><strong>Categoría:</strong> {selectedDocument.category}</p>
                    <p><strong>Versión:</strong> {selectedDocument.version || '1.0'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Metadatos</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Subido por:</strong> {selectedDocument.uploaded_by}</p>
                    <p><strong>Fecha de subida:</strong> {new Date(selectedDocument.uploaded_at).toLocaleDateString()}</p>
                    <p><strong>Nivel de acceso:</strong> {getAccessLevelBadge(selectedDocument.access_level)}</p>
                    {selectedDocument.last_accessed && (
                      <p><strong>Último acceso:</strong> {new Date(selectedDocument.last_accessed).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
