import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ActivitySquare, Gauge, Layers, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dev-only performance diagnostics panel
// Reads from Performance APIs to summarize slow resources, long tasks and bundle budgets

function formatKB(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

function formatMs(ms: number) {
  return `${Number(ms.toFixed(0))} ms`;
}

export const PerfDebugPanel: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [summary, setSummary] = React.useState(() => ({
    jsTotal: 0,
    jsMaxChunk: 0,
    longTasks: [] as PerformanceEntry[],
    slowResources: [] as PerformanceResourceTiming[],
    resourceCount: 0,
  }));

  const collect = React.useCallback(() => {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const scripts = resources.filter((r) => r.initiatorType === 'script');
      const jsTotal = scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const jsMaxChunk = scripts.reduce((max, r) => Math.max(max, r.transferSize || 0), 0);

      // Long tasks (buffered true in web-vitals init)
      // @ts-ignore
      const longTasks = (performance.getEntriesByType('longtask') as PerformanceEntry[]).filter((e) => e.duration >= 50);

      const slowResources = resources
        .filter((r) => r.duration > 2000)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      setSummary({ jsTotal, jsMaxChunk, longTasks, slowResources, resourceCount: resources.length });
    } catch {}
  }, []);

  React.useEffect(() => {
    if (open) collect();
  }, [open, collect]);

  const JS_TOTAL_BUDGET = 600_000; // bytes, keep in sync with web-vitals budgets
  const CHUNK_MAX_BUDGET = 300_000; // bytes

  const jsTotalOver = summary.jsTotal > JS_TOTAL_BUDGET;
  const jsChunkOver = summary.jsMaxChunk > CHUNK_MAX_BUDGET;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="sm" variant="default" className="shadow">
            <Gauge className="mr-2 h-4 w-4" /> Perf
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Diagnóstico de rendimiento</SheetTitle>
          </SheetHeader>
          <div className="p-2 sm:p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={collect}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Refrescar
              </Button>
              <Badge variant={jsTotalOver ? 'destructive' : 'secondary'} title="JS total transfer size">
                JS total: {formatKB(summary.jsTotal)} {jsTotalOver ? `(&gt;${formatKB(JS_TOTAL_BUDGET)})` : ''}
              </Badge>
              <Badge variant={jsChunkOver ? 'destructive' : 'secondary'} title="Max JS chunk size">
                Chunk máx: {formatKB(summary.jsMaxChunk)} {jsChunkOver ? `(&gt;${formatKB(CHUNK_MAX_BUDGET)})` : ''}
              </Badge>
              <Badge variant="outline" title="Número de recursos cargados">
                Recursos: {summary.resourceCount}
              </Badge>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Recursos lentos (&gt;2s)
                </CardTitle>
                <Badge variant="outline">Top {summary.slowResources.length}</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-56">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Duración</TableHead>
                        <TableHead className="text-right">Transfer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.slowResources.map((r) => (
                        <TableRow key={`${r.name}-${r.startTime}`}> 
                          <TableCell className="truncate max-w-[220px]" title={r.name}>{r.name}</TableCell>
                          <TableCell>{r.initiatorType}</TableCell>
                          <TableCell className="text-right">{formatMs(r.duration)}</TableCell>
                          <TableCell className="text-right">{formatKB(r.transferSize || 0)}</TableCell>
                        </TableRow>
                      ))}
                      {summary.slowResources.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm opacity-70">Sin recursos lentos detectados</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <ActivitySquare className="h-4 w-4" /> Long tasks (≥50ms)
                </CardTitle>
                <Badge variant="outline">{summary.longTasks.length}</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Inicio</TableHead>
                        <TableHead className="text-right">Duración</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.longTasks.map((e, i) => (
                        <TableRow key={`${e.startTime}-${i}`}>
                          <TableCell>{formatMs(e.startTime)}</TableCell>
                          <TableCell className="text-right">{formatMs(e.duration)}</TableCell>
                        </TableRow>
                      ))}
                      {summary.longTasks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-sm opacity-70">Sin long tasks detectados</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PerfDebugPanel;
