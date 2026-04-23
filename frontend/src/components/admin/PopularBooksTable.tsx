import React from 'react';
import { BookOpen, TrendingUp } from 'lucide-react';

interface PopularBook {
  id: number;
  title: string;
  cover_image_url: string | null;
  price: number;
  sales_count: number;
  total_revenue: number;
}

interface PopularBooksTableProps {
  books: PopularBook[];
}

const PopularBooksTable: React.FC<PopularBooksTableProps> = ({ books }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={24} className="text-[#D4AF37]" />
        Libros Más Vendidos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1B4D3E] text-white">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Libro</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Ventas</th>
              <th className="px-4 py-3 text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-[#D4AF37]">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <BookOpen size={20} className="text-gray-400" />
                      </div>
                    )}
                    <span className="font-semibold text-gray-800">{book.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">${book.price}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1B4D3E]">
                  {book.sales_count}
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#D4AF37]">
                  ${book.total_revenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {books.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay datos de ventas disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularBooksTable;
