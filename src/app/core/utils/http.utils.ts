import { HttpParams } from '@angular/common/http';

export class HttpUtils {
  /**
   * Construye un objeto HttpParams ignorando propiedades que sean null, undefined o cadenas vacías.
   * Esto previene que se envíen filtros como `?keyword=&status=` al backend.
   * @param paramsObj Un objeto con los parámetros a enviar.
   * @returns Un HttpParams limpio listo para enviar en la petición GET.
   */
  static buildCleanParams(paramsObj: Record<string, any>): HttpParams {
    let params = new HttpParams();

    if (!paramsObj) {
      return params;
    }

    Object.keys(paramsObj).forEach(key => {
      const value = paramsObj[key];
      // Ignora nulos, indefinidos y cadenas completamente vacías.
      // Retiene false, 0, y cadenas con espacios.
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
