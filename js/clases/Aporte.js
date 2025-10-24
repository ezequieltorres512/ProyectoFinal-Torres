class Aporte {
    constructor(id, nombre, monto) {
        this.id = id;
        this.nombre = nombre;
        this.monto = monto;
    }

    estado(cuota) {
        const dif = this.monto - cuota;
        if (dif > 0) return "✅ Puso de más $" + dif;
        if (dif < 0) return "❌ Debe $" + dif * -1;
        return "✔️ Puso lo justo";
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
    
    getMonto(){
        return this.monto;
    }

    setMonto(nuevo_monto){
        this.monto = nuevo_monto;
    }  
}




