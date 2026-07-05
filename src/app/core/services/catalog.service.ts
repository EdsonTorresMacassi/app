import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap, shareReplay, map } from 'rxjs/operators';
import { HttpUtils } from '../utils/http.utils';
import { CatalogItem } from '../models/catalog/catalog.model';

export interface CatalogPageResponse {
  content: CatalogItem[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<CatalogItem[]>>();

  getActiveCatalogsByType(parentCode: string): Observable<CatalogItem[]> {
    const timestamp = new Date().getTime();
    return this.http.get<any>(`${environment.apiUrl}/catalogs/${parentCode}?_t=${timestamp}`)
      .pipe(
        map(res => res?.data || res || []),
        shareReplay(1)
      );
  }

  // --- Endpoints Administrativos ---

  getCatalogMasters(page = 0, size = 10, keyword?: string, status?: string): Observable<CatalogPageResponse> {
    // Si status viene como string 'ACTIVE' o 'INACTIVE', lo enviamos como boolean
    let statusBool: boolean | undefined = undefined;
    if (status === 'ACTIVE') statusBool = true;
    if (status === 'INACTIVE') statusBool = false;
    
    const params = HttpUtils.buildCleanParams({ page, size, keyword, status: statusBool });
    return this.http.get<unknown>(`${environment.apiUrl}/admin/catalogs/types`, { params }).pipe(
      map((res: unknown) => {
        const response = res as { data?: CatalogPageResponse, content?: CatalogItem[] };
        // Backend retorna ApiResponse<Page<CatalogResponseDTO>>
        if (response?.data?.content !== undefined) return response.data;
        if (response?.content !== undefined) return response as CatalogPageResponse;
        return { content: [] };
      })
    );
  }

  getCatalogsAdmin(parentId: number, page = 0, size = 10, keyword?: string, status?: string): Observable<CatalogPageResponse> {
    let statusBool: boolean | undefined = undefined;
    if (status === 'ACTIVE') statusBool = true;
    if (status === 'INACTIVE') statusBool = false;

    const params = HttpUtils.buildCleanParams({ type: parentId, page, size, keyword, status: statusBool });
    return this.http.get<unknown>(`${environment.apiUrl}/admin/catalogs/items`, { params }).pipe(
      map((res: unknown) => {
        const response = res as { data?: CatalogPageResponse, content?: CatalogItem[] };
        if (response?.data?.content !== undefined) return response.data;
        if (response?.content !== undefined) return response as CatalogPageResponse;
        return { content: [] };
      })
    );
  }

  createCatalog(catalog: Partial<CatalogItem>, cacheKey?: string): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${environment.apiUrl}/admin/catalogs`, catalog).pipe(
      tap(() => {
        this.clearCache(cacheKey);
      })
    );
  }

  updateCatalog(id: number, catalog: Partial<CatalogItem>, cacheKey?: string): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(`${environment.apiUrl}/admin/catalogs/${id}`, catalog).pipe(
      tap(() => {
        this.clearCache(cacheKey);
      })
    );
  }

  toggleCatalogStatus(id: number, cacheKey?: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/admin/catalogs/${id}/status`, {}).pipe(
      tap(() => {
        this.clearCache(cacheKey);
      })
    );
  }

  deleteCatalog(id: number, cacheKey?: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/catalogs/${id}`).pipe(
      tap(() => {
        this.clearCache(cacheKey);
      })
    );
  }

  clearCache(key?: string) {
    // Ya no es necesario limpiar el caché manual del frontend porque se delega al backend (Redis).
    // Esto previene los bugs de desincronización entre múltiples pestañas del navegador.
  }
}
