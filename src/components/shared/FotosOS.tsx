import { useState, useEffect, useRef } from 'react';
import { Camera, X, Plus, Loader2, ImageOff } from 'lucide-react';
import { fotoService } from '@/services/api';
import { toast } from 'sonner';

interface FotosOSProps {
  ordemId: string;
  readOnly?: boolean;
}

export function FotosOS({ ordemId, readOnly = false }: FotosOSProps) {
  const [fotos, setFotos] = useState<{ url: string; tipo: string; path: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tipoAtivo, setTipoAtivo] = useState<'problema' | 'servico'>('problema');
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await fotoService.listar(ordemId);
      setFotos(data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [ordemId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await fotoService.upload(ordemId, file, tipoAtivo);
      await load();
      toast.success('Foto adicionada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar foto');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await fotoService.deletar(path);
      await load();
      toast.success('Foto removida!');
    } catch { toast.error('Erro ao remover foto'); }
  };

  const fotosproblema = fotos.filter(f => f.tipo === 'problema');
  const fotosServico = fotos.filter(f => f.tipo === 'servico');

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fotos</p>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <div className="flex bg-secondary rounded-lg p-0.5">
              <button onClick={() => setTipoAtivo('problema')}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${tipoAtivo === 'problema' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                Problema
              </button>
              <button onClick={() => setTipoAtivo('servico')}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${tipoAtivo === 'servico' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                Serviço
              </button>
            </div>
            <button onClick={() => inputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium active:scale-95 transition-transform disabled:opacity-50">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Foto
            </button>
            <input ref={inputRef} type="file" accept="image/*" capture="environment"
              onChange={handleUpload} className="hidden" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
      ) : fotos.length === 0 ? (
        <div className="flex items-center justify-center py-6 border border-dashed border-border rounded-xl">
          <div className="text-center">
            <ImageOff size={24} className="text-muted-foreground/30 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Nenhuma foto adicionada</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fotosproblema.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase">Problema</p>
              <div className="grid grid-cols-3 gap-2">
                {fotosproblema.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={f.url} alt="Foto problema" className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreview(f.url)} />
                    {!readOnly && (
                      <button onClick={() => handleDelete(f.path)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                        <X size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {fotosServico.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase">Serviço Realizado</p>
              <div className="grid grid-cols-3 gap-2">
                {fotosServico.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={f.url} alt="Foto serviço" className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreview(f.url)} />
                    {!readOnly && (
                      <button onClick={() => handleDelete(f.path)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                        <X size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview fullscreen */}
      {preview && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center" onClick={() => setPreview(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
