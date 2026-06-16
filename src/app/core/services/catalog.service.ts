import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { tap, shareReplay, map } from 'rxjs/operators';

export interface CatalogItem {
  catalogId?: number;
  catalogType?: string;
  parentId?: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<CatalogItem[]>>();

  /**
   * Obtiene los catálogos activos por el código del padre (ej: 'GENDER')
   */
  getActiveCatalogsByType(parentCode: string): Observable<CatalogItem[]> {
    if (!this.cache.has(parentCode)) {
      const request$ = this.http.get<CatalogItem[]>(`${environment.apiUrl}/catalogs/${parentCode}`)
        .pipe(shareReplay(1));
      this.cache.set(parentCode, request$);
    }
    return this.cache.get(parentCode)!;
  }

  // --- Endpoints Administrativos ---

  getCatalogMasters(): Observable<CatalogItem[]> {
    return this.http.get<any>(`${environment.apiUrl}/admin/catalogs/types`).pipe(
      map((res: any) => {
        // El backend puede devolver un Page<> o un array directo
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.content && Array.isArray(res.content)) return res.content;
        if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
        return [];
      })
    );
  }

  getCatalogsAdmin(parentId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/catalogs/items?type=${parentId}&page=${page}&size=${size}`).pipe(
      map((res: any) => {
        // Backend retorna ApiResponse<Page<CatalogResponseDTO>>
        // Necesitamos el Page object con su campo 'content'
        if (res?.data?.content !== undefined) return res.data;  // ApiResponse wrapper
        if (res?.content !== undefined) return res;             // Page directo
        return { content: [] };
      })
    );
  }

  createCatalog(catalog: Partial<CatalogItem>, cacheKey?: string): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${environment.apiUrl}/admin/catalogs`, catalog).pipe(
      tap(() => {
        if (cacheKey) this.clearCache(cacheKey);
      })
    );
  }

  updateCatalog(id: number, catalog: Partial<CatalogItem>, cacheKey?: string): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(`${environment.apiUrl}/admin/catalogs/${id}`, catalog).pipe(
      tap(() => {
        if (cacheKey) this.clearCache(cacheKey);
      })
    );
  }

  toggleCatalogStatus(id: number, cacheKey?: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/admin/catalogs/${id}/status`, {}).pipe(
      tap(() => {
        if (cacheKey) this.clearCache(cacheKey);
      })
    );
  }

  deleteCatalog(id: number, cacheKey?: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/catalogs/${id}`).pipe(
      tap(() => {
        if (cacheKey) this.clearCache(cacheKey);
      })
    );
  }

  clearCache(key: string) {
    this.cache.delete(key);
  }
}
