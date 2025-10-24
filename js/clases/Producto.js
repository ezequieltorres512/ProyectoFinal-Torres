class Producto{
    constructor(id, nombre, precio_unidad, cantidad){    
        this.id = id;
        this.nombre = nombre;
        this.precio = precio_unidad;
        this.cantidad = cantidad;
    }

    subtotal(){
        return this.precio*this.cantidad;
    }

    getId(){
        return this.id;
    }

    setId(nuevo_id){
        this.id = nuevo_id;
    }

    getNombre(){
        return this.nombre;
    }

    setNombre(nuevo_nombre){
        this.nombre = nuevo_nombre;
    }

    getPrecio() {
        return this.precio;
    }

    setPrecio(nuevo_precio) {
        this.precio = nuevo_precio;
    }

    getCantidad() {
        return this.cantidad;
    }

    setCantidad(nuevo_cantidad) {
        this.cantidad = nuevo_cantidad;
    }
}