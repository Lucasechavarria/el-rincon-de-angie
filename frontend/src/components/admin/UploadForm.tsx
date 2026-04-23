import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Image as ImageIcon, DollarSign, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const UploadForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [previewPercentage, setPreviewPercentage] = useState(10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [publicationType, setPublicationType] = useState('story');
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/categories');
        setCategories(response.data);
        if (response.data.length > 0) setSelectedCategory(response.data[0].id);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ message: '', type: '' });
    setLoading(true);

    if (!contentFile) {
      setFeedback({ message: 'Debes seleccionar un archivo de contenido.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', String(price));
      formData.append('preview_percentage', String(previewPercentage));
      // publication_type is not yet supported by backend, but we keep it in state
      formData.append('category_id', selectedCategory);
      formData.append('content_file', contentFile);
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setFeedback({ message: 'No estás autenticado. Por favor inicia sesión.', type: 'error' });
        setLoading(false);
        return;
      }

      await axios.post('http://localhost:8000/books/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setFeedback({ message: '¡Publicación subida con éxito!', type: 'success' });
      // Reset form
      setTitle('');
      setDescription('');
      setPrice(0);
      setPreviewPercentage(10);
      setContentFile(null);
      setCoverImage(null);

    } catch (error) {
      console.error('Error uploading book:', error);
      if (axios.isAxiosError(error) && error.response) {
        setFeedback({ message: `Error: ${error.response.data.detail || 'Error al subir la publicación.'}`, type: 'error' });
      } else {
        setFeedback({ message: 'Error de conexión o del servidor.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div className="group">
        <label htmlFor="title" className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif uppercase tracking-wider">Título de la Obra</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-[#F5F5DC]/30 border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50] placeholder-[#1B4D3E]/30"
          placeholder="Ej: El Misterio del Bosque Encantado"
          required
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif uppercase tracking-wider">Sinopsis / Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-3 bg-[#F5F5DC]/30 border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50] placeholder-[#1B4D3E]/30"
          placeholder="Escribe una breve descripción que atrape al lector..."
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price */}
        {/* Price and Currency */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="price" className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} /> Precio
            </label>
            <input
              type="number"
              id="price"
              value={price || ''}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full p-3 bg-[#F5F5DC]/30 border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50]"
              required
              disabled={loading}
            />
          </div>
          <div className="w-24">
            <label htmlFor="currency" className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif uppercase tracking-wider">
              Moneda
            </label>
            <select
              id="currency"
              className="w-full p-3 bg-[#F5F5DC]/30 border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50]"
              defaultValue="ARS"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Preview Percentage */}
        <div>
          <label htmlFor="preview" className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif uppercase tracking-wider flex items-center gap-2">
            <Eye size={14} /> Previsualización (%)
          </label>
          <input
            type="number"
            id="preview"
            value={previewPercentage || ''}
            onChange={(e) => setPreviewPercentage(parseInt(e.target.value) || 0)}
            min="0"
            max="100"
            className="w-full p-3 bg-[#F5F5DC]/30 border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50]"
            required
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="text-sm font-bold text-[#1B4D3E] block mb-2 font-serif uppercase tracking-wider">Género / Categoría</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 bg-[#F5F5DC]/30 border border-[#1B4D3E]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-[#2C3E50]"
            required
            disabled={loading}
          >
            <option value="" disabled>Seleccionar Género</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content File */}
        <div className="border-2 border-dashed border-[#1B4D3E]/20 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-[#F5F5DC]/20 transition-colors cursor-pointer relative">
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setContentFile)}
            accept=".pdf,.docx,.txt"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required
            disabled={loading}
          />
          <FileText className="text-[#1B4D3E]/50 mb-2" size={32} />
          <span className="text-sm font-bold text-[#1B4D3E] block">Archivo de Contenido</span>
          <span className="text-xs text-[#1B4D3E]/60 block mt-1">PDF, DOCX o TXT</span>
          {contentFile && (
            <div className="mt-2 flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
              <CheckCircle size={12} /> {contentFile.name}
            </div>
          )}
        </div>

        {/* Cover Image */}
        <div className="border-2 border-dashed border-[#1B4D3E]/20 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-[#F5F5DC]/20 transition-colors cursor-pointer relative">
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setCoverImage)}
            accept="image/png, image/jpeg"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <ImageIcon className="text-[#1B4D3E]/50 mb-2" size={32} />
          <span className="text-sm font-bold text-[#1B4D3E] block">Portada (Opcional)</span>
          <span className="text-xs text-[#1B4D3E]/60 block mt-1">JPG o PNG</span>
          {coverImage && (
            <div className="mt-2 flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
              <CheckCircle size={12} /> {coverImage.name}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Message */}
      {feedback.message && (
        <div className={`flex items-center gap-3 p-4 rounded-md ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {feedback.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-4 px-6 bg-[#1B4D3E] hover:bg-[#153e32] text-[#D4AF37] font-bold rounded-md transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Publicar Obra</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;
