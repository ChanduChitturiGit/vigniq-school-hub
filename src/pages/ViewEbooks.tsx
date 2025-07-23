import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Eye, Download, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

interface Ebook {
  id: string;
  title: string;
  board: string;
  class: string;
  subject: string;
  uploadType: string;
  uploadDate: string;
  files: {
    id: string;
    name: string;
    url: string;
    type: 'pdf';
  }[];
}

const ViewEbooks: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    board: '',
    class: '',
    subject: ''
  });
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  // Sample data
  const sampleEbooks: Ebook[] = [
    {
      id: '1',
      title: 'Mathematics_Chapter1',
      board: 'CBSE',
      class: 'Class 10',
      subject: 'Mathematics',
      uploadType: 'Chapter Wise PDF',
      uploadDate: '2023-10-26',
      files: [
        { id: '1', name: 'Mathematics_Chapter1.pdf', url: '/sample.pdf', type: 'pdf' }
      ]
    },
    {
      id: '2',
      title: 'Physics_Optics_Notes',
      board: 'CBSE',
      class: 'Class 12',
      subject: 'Physics',
      uploadType: 'Single PDF',
      uploadDate: '2023-10-25',
      files: [
        { id: '2', name: 'Physics_Optics_Notes.pdf', url: '/sample.pdf', type: 'pdf' }
      ]
    },
    {
      id: '3',
      title: 'Chemistry_Organic_Basics',
      board: 'ICSE',
      class: 'Class 11',
      subject: 'Chemistry',
      uploadType: 'Chapter Wise PDF',
      uploadDate: '2023-10-24',
      files: [
        { id: '3', name: 'Chemistry_Organic_Basics.pdf', url: '/sample.pdf', type: 'pdf' }
      ]
    }
  ];

  const boards = ['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'];
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Hindi', 'Computer Science'];

  useEffect(() => {
    setEbooks(sampleEbooks);
    setFilteredEbooks(sampleEbooks);
  }, []);

  useEffect(() => {
    let filtered = ebooks;

    if (filters.board) {
      filtered = filtered.filter(ebook => ebook.board === filters.board);
    }
    if (filters.class) {
      filtered = filtered.filter(ebook => ebook.class === filters.class);
    }
    if (filters.subject) {
      filtered = filtered.filter(ebook => ebook.subject === filters.subject);
    }

    setFilteredEbooks(filtered);
  }, [filters, ebooks]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleView = (ebook: Ebook) => {
    setSelectedEbook(ebook);
  };

  const handleDownload = (file: { name: string; url: string }) => {
    // Simulate download
    toast.success(`Downloading ${file.name}...`);
  };

  const handleDelete = (ebookId: string) => {
    if (user?.role === 'superadmin') {
      setEbooks(prev => prev.filter(ebook => ebook.id !== ebookId));
      toast.success('E-book deleted successfully');
    } else {
      toast.error('Only super admin can delete e-books');
    }
  };

  const clearFilters = () => {
    setFilters({
      board: '',
      class: '',
      subject: ''
    });
  };

  return (
    <MainLayout pageTitle="View E-books">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">View E-books</h1>
          <p className="text-gray-600 mt-2">Browse and access available educational materials</p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Board Name</label>
                <Select value={filters.board} onValueChange={(value) => handleFilterChange('board', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <Select value={filters.class} onValueChange={(value) => handleFilterChange('class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* E-books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEbooks.map((ebook) => (
            <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 truncate w-full" title={ebook.title}>
                    {ebook.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500 mb-4 w-full">
                    <p>{ebook.board} • {ebook.class}</p>
                    <p>{ebook.subject}</p>
                    <p className="text-xs mt-1">Uploaded: {ebook.uploadDate}</p>
                  </div>
                  
                  <div className="flex space-x-2 w-full">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleView(ebook)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{selectedEbook?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-4">
                            {selectedEbook?.board} • {selectedEbook?.class} • {selectedEbook?.subject}
                          </p>
                          <div className="bg-gray-100 rounded-lg p-8 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">PDF Viewer would be integrated here</p>
                            <p className="text-sm text-gray-500 mt-2">
                              In a real implementation, this would show the PDF content
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-green-600 hover:bg-green-50"
                      onClick={() => handleDownload(ebook.files[0])}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    
                    {user?.role === 'superadmin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(ebook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEbooks.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No E-books Found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new content.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ViewEbooks;
