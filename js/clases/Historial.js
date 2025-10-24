class Historial {
    constructor(id, accion, detalles) {
        this.id = id;
        this.accion = accion;
        this.detalles = detalles;
        this.fecha = this.obtenerFechaHoraLuxon(); 
    }

    obtenerFechaHoraLuxon() {
        const DateTime = luxon.DateTime;
        const now = DateTime.now();
        return now.toFormat('dd/LL/yyyy HH:mm:ss'); 
    }

    getId() {
        return this.id;
    }

    getAccion() {
        return this.accion;
    }

    getDetalles() {
        return this.detalles;
    }

    getFecha() {
        return this.fecha;
    }
}