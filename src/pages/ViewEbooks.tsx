import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Eye, Download, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '../components/ui/dialog';
import { getBoardsList } from '../services/school'
import { getEbookList, deleteEbookById } from '../services/ebooks'
import { getClassesList } from '../services/class'
import { getSubjectsList } from '../services/subject'
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import sampleData from '../services/ebooksData.json'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';



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
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loader, setLoader] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false);
  const [viewLoader, setViewLoader] = useState(false);
  const [filters, setFilters] = useState({
    board: '',
    class: '',
    subject: '',
    board_id: null,
    class_id: null,
    subject_id: null,
    page: 1,
    yearString: '',
    year: null
  });
  const [payload, setPayload] = useState({
    board_id: null,
    class_id: null,
    subject_id: null,
    year: null,
    page: 1
  });
  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState<any[]>([]);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
  const [viewId, setViewId] = useState(null);
  const [downloadId, setDownloadId] = useState(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);


  // Sample data
  const sampleEbooks: any = sampleData;

  const sampleBoards = ['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'];
  const smapleClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sampleSubjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Hindi', 'Computer Science'];

  const boardsList = async () => {
    const response = await getBoardsList();
    if (response && response.boards) {
      setBoards(response.boards);
    }
  }

  const classList = async () => {
    const response = await getClassesList();
    if (response && response.data) {
      setClasses(response.data);
    }
  }

  const subjectsList = async () => {
    const response = await getSubjectsList();
    if (response) {
      setSubjects(response);
    }
  }

  const ebookData = async (data, condition = false,start : Number = 0) => {
    if (!hasMore && !condition) return;
    try {
      setLoader(true);
      const response = await getEbookList(data);
      if (response && response.data && response.data.length > 0) {
        if (page == 1 || start == 1) {
          setEbooks(response.data);
          //setFilteredEbooks(response.data);
        }
        else {
          setEbooks(prev => [...prev, ...response.data]);
          //setFilteredEbooks(prev => [...prev, ...response.data]);
        }
      }
      if (response && (response.message || response.data.length < 10)) {
        setHasMore(false);
      }
      setLoader(false);
    } catch (error) {
      if (error?.response?.data?.error == 'No eBooks found for the given criteria.') {
        //  setFilteredEbooks([]);
        setEbooks([]);
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: error?.response?.data?.error || "Something went wrong",
          status: "error"
        });
      }
      setLoader(false);
    }

  }

  const deleteEbook = async (ebookId: string) => {
    try {
      const response = await deleteEbookById({ ebook_id: ebookId });
      if (response && response.message) {
        setEbooks(prev => prev.filter(ebook => ebook.id !== ebookId));
        // setFilteredEbooks(prev => prev.filter(ebook => ebook.id !== ebookId));
        showSnackbar({
          title: "Success",
          description: "E-book deleted successfully",
          status: "success"
        });
      } else {
        showSnackbar({
          title: "⛔ Error",
          description: response.message || "Failed to delete e-book",
          status: "error"
        });
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    boardsList();
    classList();
    subjectsList();
    ebookData(payload);
  }, []);


  const handleScroll = () => {
    const container = scrollContainerRef.current;
    const isBottom =
      (container.scrollHeight - container.scrollTop) <= (container.clientHeight + (loader ? (-200) : 10));
    //console.log('scrollScheck',(!container || loader || !hasMore || !isBottom));
    if (!container || loader || !hasMore || !isBottom) {
      return; // avoid multiple calls while loading
    } else {
      //console.log('scrolled');
      if (isBottom && hasMore && !loader) {
        setPage(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    if (page > 1) {
      ebookData({ ...payload, page });
    }
  }, [page]);

  useEffect(() => {
    setHasMore(true);
    setPage(1);
    ebookData({ ...payload, page : 1 }, true,1);
    
  }, [payload.board_id, payload.class_id, payload.subject_id, payload.year]);

  const getBoardId = (data: string) => {
    const boardData = boards.find((val: any) => (val.name) == data);
    const boardId = boardData.id ? boardData.id : null;
    return boardId;
  }

  const getClassId = (data: string) => {
    const classData = classes.find((val: any) => ('Class ' + val.class_number) == data);
    const classId = classData.id ? classData.id : null;
    return classId;
  }

  const getSubjectId = (data: string) => {
    const subjectData = subjects.find((val: any) => (val.name) == data);
    const subjectId = subjectData.id ? subjectData.id : null;
    return subjectId;
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    if (field == 'board') {
      setPayload(prev => ({
        ...prev,
        'board_id': getBoardId(value)
      }));
    } else if (field == 'class') {
      setPayload(prev => ({
        ...prev,
        'class_id': getClassId(value)
      }));
    } else if (field == 'subject') {
      setPayload(prev => ({
        ...prev,
        'subject_id': getSubjectId(value)
      }));
    } else if (field == 'yearString') {
      setPayload(prev => ({
        ...prev,
        'year': Number(value)
      }));
    }
  };

  const handleView = async (ebook: any, index: any) => {
    setViewLoader(true);
    setViewId(index);
    // setSelectedEbook(ebook);
    const fileUrl = ebook.file_path;
    // window.open(fileUrl, "_blank");
    const res = await fetch(fileUrl);
    const blob = await res.blob();
    const file = URL.createObjectURL(blob);
    setViewLoader(false);
    window.open(file, "_blank");

  };

  const handleDownload = async (ebook: any, index: any) => {
    // Simulate download
    setDownloadId(index);
    setDownloadLoader(true);
    try {
      const fileUrl = ebook.file_path;
      const res = await fetch(fileUrl);
      const blob = await res.blob();

      // Create a temporary download link
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      // Extract filename from the S3 path or use a default one
      const filename = `${ebook.board}_Class_${ebook.class_number}_${ebook.subject_name}` || "downloaded-file";
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      showSnackbar({
        title: "Success",
        description: `PDF downloaded succesfully ✅`,
        status: "success"
      });
      setDownloadLoader(false);
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: `Something went wrong please try again!`,
        status: "error"
      });
    }
  };


  const handleDelete = (ebookId: string) => {
    // if (user?.role === 'superadmin') {
    //   setEbooks(prev => prev.filter(ebook => ebook.id !== ebookId));
    //   toast.success('E-book deleted successfully');
    // } else {
    //   toast.error('Only super admin can delete e-books');
    // }
    if (user?.role === 'superadmin') {
      deleteEbook(ebookId);
    } else {
      showSnackbar({
        title: "⛔ Error",
        description: "Only super admin can delete e-books",
        status: "error"
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      board: '',
      class: '',
      subject: '',
      board_id: null,
      class_id: null,
      subject_id: null,
      yearString: '',
      year: null,
      page: 1
    });
    setPayload({
      board_id: null,
      class_id: null,
      subject_id: null,
      year: null,
      page: 1
    });
    setPage(1);
    //getEbookList(payload);
  };

  return (
    <MainLayout ref={scrollContainerRef} pageTitle="View E-books">
      <div className="p-6">
        {/* <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">View E-books</h1>
          <p className="text-gray-600 mt-2">Browse and access available educational materials</p>
        </div> */}

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Board Name</label>
                <Select value={filters.board} onValueChange={(value) => handleFilterChange('board', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
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
                  <SelectContent className="h-64">
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={'Class ' + cls.class_number}>{'Class ' + cls.class_number}</SelectItem>
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
                  <SelectContent className="h-64">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <Select value={filters.yearString} onValueChange={(value) => handleFilterChange('yearString', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a year" />
                  </SelectTrigger>
                  <SelectContent className='h-64'>
                    {years.map((val, index) => (
                      <SelectItem key={index} value={val}>
                        {val}
                      </SelectItem>
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
          {Array.isArray(ebooks) && ebooks.map((ebook, index) => (
            <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2 truncate w-full" title={ebook.ebook_name}>
                    {ebook.ebook_name}
                  </h3>

                  <div className="text-sm text-gray-500 mb-4 w-full">
                    <p>{ebook.board} • {'Class ' + ebook.class_number}</p>
                    <p>{ebook.subject_name}</p>
                    <p className="text-xs mt-1">Uploaded: {ebook.uploaded_at}</p>
                  </div>

                  <div className="flex space-x-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-600 hover:bg-green-50"
                      onClick={() => handleView(ebook, index)}
                    >
                      {viewLoader && viewId == index ? (<Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />) : (<Eye className="w-4 h-4 mr-1" />)}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-green-600 hover:bg-green-50"
                      onClick={() => handleDownload(ebook, index)}
                    >
                      {downloadLoader && downloadId == index ? (<Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />) : (<Download className="w-4 h-4 mr-1" />)}
                    </Button>

                    {user?.role === 'superadmin' && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 text-red-500 hover:text-red-600 px-4 py-2 rounded-lg  transition-colors">
                              <Trash2 className="w-4 h-4" />
                              {/* Reset Password */}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete E-Book</AlertDialogTitle>
                              <AlertDialogDescription className='text-gray-700'>
                                <p>Are you sure you want to delete E-Book <span className='font-bold'>{ebook.ebook_name}</span>?</p>
                                This action cannot be undone
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(ebook.id)} className="bg-red-600 hover:bg-red-700">
                                Confirm Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Array.isArray(ebooks) && ebooks.length === 0 && !loader && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No E-books Found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new content.</p>
          </div>
        )}
        {loader && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ViewEbooks;
