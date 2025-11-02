import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Upload, Link2, Film, FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SecureVault = () => {
  const [items, setItems] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newEmbed, setNewEmbed] = useState({ title: '', url: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState('note');
  const [file, setFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('secure_vault_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vault items:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch vault items.' });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const saveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('secure_vault_items')
      .insert([{ 
        user_id: user.id,
        type: 'note',
        title: newNote.title,
        content: newNote.content
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving note:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save note.' });
    } else {
      setItems([data, ...items]);
      setNewNote({ title: '', content: '' });
      setIsAdding(false);
      toast({
        title: "Note Saved! 🔒",
        description: "Your secure note has been stored"
      });
    }
  };

  const saveEmbed = async () => {
    if (!newEmbed.title.trim() || !newEmbed.url.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and URL",
        variant: "destructive"
      });
      return;
    }

    const embedType = detectEmbedType(newEmbed.url);

    const { data, error } = await supabase
      .from('secure_vault_items')
      .insert([{ 
        user_id: user.id,
        type: 'embed',
        title: newEmbed.title,
        embed_url: newEmbed.url,
        embed_type: embedType
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving embed:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save embed.' });
    } else {
      setItems([data, ...items]);
      setNewEmbed({ title: '', url: '' });
      setIsAdding(false);
      toast({
        title: "Embed Saved! 🔗",
        description: "Your embeddable link has been stored"
      });
    }
  };

  const uploadFile = async () => {
    if (!file || !fileTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and provide a title",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vault-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('vault-files')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('secure_vault_items')
        .insert([{ 
          user_id: user.id,
          type: 'file',
          title: fileTitle,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        }])
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setFile(null);
      setFileTitle('');
      setIsAdding(false);
      toast({
        title: "File Uploaded! 📁",
        description: "Your file has been securely stored"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not upload file.' });
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (id, fileUrl) => {
    if (fileUrl) {
      const filePath = fileUrl.split('/vault-files/')[1];
      if (filePath) {
        await supabase.storage.from('vault-files').remove([filePath]);
      }
    }

    const { error } = await supabase
      .from('secure_vault_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete item.' });
    } else {
      setItems(items.filter(item => item.id !== id));
      toast({
        title: "Item Deleted",
        description: "The item has been removed from your vault"
      });
    }
  };

  const detectEmbedType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    if (url.includes('spotify.com')) return 'spotify';
    return 'generic';
  };

  const getEmbedUrl = (url, type) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  const renderItem = (item, index) => {
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="bg-slate-950/50 border-slate-700 p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {item.type === 'note' && <FileText className="w-5 h-5 text-blue-500" />}
                {item.type === 'file' && <FileIcon className="w-5 h-5 text-green-500" />}
                {item.type === 'embed' && <Link2 className="w-5 h-5 text-purple-500" />}
                <h4 className="text-lg font-bold text-white">{item.title}</h4>
              </div>
              <p className="text-sm text-slate-400">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={() => deleteItem(item.id, item.file_url)}
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {item.type === 'note' && (
            <p className="text-slate-300 whitespace-pre-wrap">{item.content}</p>
          )}

          {item.type === 'file' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-800">
                <div>
                  <p className="text-sm text-slate-300">{item.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {item.file_type} • {(item.file_size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <a href={item.file_url} download target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-green-600 text-green-500">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
              {item.file_type?.startsWith('image/') && (
                <img src={item.file_url} alt={item.title} className="rounded border border-slate-700 max-h-96 object-contain" />
              )}
            </div>
          )}

          {item.type === 'embed' && (
            <div className="space-y-3">
              {(item.embed_type === 'youtube' || item.embed_type === 'vimeo') ? (
                <div className="aspect-video rounded overflow-hidden border border-slate-700">
                  <iframe
                    src={getEmbedUrl(item.embed_url, item.embed_type)}
                    className="w-full h-full"
                    allowFullScreen
                    title={item.title}
                  ></iframe>
                </div>
              ) : (
                <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                  <a 
                    href={item.embed_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {item.embed_url}
                  </a>
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {!isAdding ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => { setIsAdding(true); setAddType('note'); }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-6"
          >
            <FileText className="w-5 h-5 mr-2" />
            Add Note
          </Button>
          <Button
            onClick={() => { setIsAdding(true); setAddType('file'); }}
            className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-6"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload File
          </Button>
          <Button
            onClick={() => { setIsAdding(true); setAddType('embed'); }}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-6"
          >
            <Link2 className="w-5 h-5 mr-2" />
            Add Embed
          </Button>
        </div>
      ) : (
        <Card className="bg-slate-950/50 border-green-700 p-6 space-y-4">
          <Tabs value={addType} onValueChange={setAddType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="note">Note</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
              <TabsTrigger value="embed">Embed</TabsTrigger>
            </TabsList>

            <TabsContent value="note" className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2">Note Title</Label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Enter note title"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2">Content</Label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter note content"
                  className="min-h-32 bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={saveNote} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save Note
                </Button>
                <Button onClick={() => { setIsAdding(false); setNewNote({ title: '', content: '' }); }} variant="outline" className="border-slate-600">
                  Cancel
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2">File Title</Label>
                <Input
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="Enter file title"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2">Select File</Label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                {file && (
                  <p className="text-sm text-slate-400 mt-2">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={uploadFile} disabled={uploading} className="flex-1 bg-green-600 hover:bg-green-700">
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
                <Button onClick={() => { setIsAdding(false); setFile(null); setFileTitle(''); }} variant="outline" className="border-slate-600">
                  Cancel
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="embed" className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2">Embed Title</Label>
                <Input
                  value={newEmbed.title}
                  onChange={(e) => setNewEmbed({ ...newEmbed, title: e.target.value })}
                  placeholder="Enter embed title"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2">URL</Label>
                <Input
                  value={newEmbed.url}
                  onChange={(e) => setNewEmbed({ ...newEmbed, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Supports: YouTube, Vimeo, and any other embeddable URL
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={saveEmbed} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Save Embed
                </Button>
                <Button onClick={() => { setIsAdding(false); setNewEmbed({ title: '', url: '' }); }} variant="outline" className="border-slate-600">
                  Cancel
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-slate-400">Loading vault...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No items in vault yet. Add your first item!</p>
          </div>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
};

export default SecureVault;
