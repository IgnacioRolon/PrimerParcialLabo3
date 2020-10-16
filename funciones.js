//Generic Functions

function $(elementId)
{
    return document.getElementById(elementId);
}

function $value(elementId)
{
    return $(elementId).value;
}

function addElementEvent(elementId, event, func)
{
    $(elementId).addEventListener(event, func);
}

function deleteRow(btn) {
    var row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function insertRowText(tbodyID, rowIndex, ...cells)
{
    var cellIndex = 0;
    var tableRef = $(tbodyID);
    if(rowIndex) //If rowIndex is valid
    {
        var newRow = tableRef.insertRow(rowIndex);
    }else{
        var newRow = tableRef.insertRow();
    }

    //Specific Functionality
    newRow.addEventListener("dblclick", function(){
        openEditWindow(this);
    });   

    for(i=0;i<cells.length;i++)
    {
        cellValue = cells[i];
        addRowText(newRow, cellValue, cellIndex);
        cellIndex++;
    }
}

function addRowText(newRow, cellValue, cellIndex)
{  
    var newCell = newRow.insertCell(cellIndex);
    var newText = document.createTextNode(cellValue);
    newCell.appendChild(newText);
}

function validateRequest(request){
    if(request.readyState == 4)
    {
        return request.status;
    }else{
        return 0;
    }
}

//Specific Functions

window.addEventListener("load", onLoad);
var peticionHttp = new XMLHttpRequest();
var listaMaterias, listaJson;
var currentIndex;

function onLoad()
{
    getMaterias();
    addElementEvent("btnClose", "click", function(){
        $("divContainer").hidden = true;
    });
    addElementEvent("btnDelete", "click", deleteMateria);
    addElementEvent("btnEdit", "click", editMateria);
}

function getMaterias()
{
    peticionHttp.onreadystatechange = respuestaGet;
    peticionHttp.open("GET", "http://localhost:3000/materias");
    peticionHttp.send();
}

function respuestaGet()
{
    if(peticionHttp.readyState == 4)
    {
        if(peticionHttp.status == 200)
        {
            listaMaterias = peticionHttp.responseText;
            addMateriasToTable();
            hideSpinner();
        }else{
            alert("Error obteniendo Materias.");
        }
    }else{
        showSpinner();
    }
}

function showSpinner()
{
    $("loader").hidden = false;
    $("mainBody").classList.add("disabled");
}

function hideSpinner()
{
    $("loader").hidden = true;
    $("mainBody").classList.remove("disabled");
}

function addMateriasToTable()
{
    listaJson = JSON.parse(listaMaterias);
    for(var i=0;i<listaJson.length;i++){
        insertRowText("tabMateriasBody", null, listaJson[i].nombre, listaJson[i].cuatrimestre, listaJson[i].fechaFinal, listaJson[i].turno);
    }
}

function openEditWindow(row)
{
    //Return all the inputs to its original class, in case there was any input error before
    $("txtNombre").className = "textBox";
    $("selCuatrimestre").className = "textBox";
    $("txtFecha").className = "textBox";

    currentIndex = row.rowIndex - 1; //Index in the information array.
    var nombre = listaJson[currentIndex].nombre;
    var cuatrimestre = listaJson[currentIndex].cuatrimestre;
    var fecha = listaJson[currentIndex].fechaFinal;
    var turno = listaJson[currentIndex].turno;

    var fechaArray = fecha.split("/");
    fecha = [fechaArray[2], fechaArray[1], fechaArray[0]].join("-"); //Change from DD/MM/YYYY to YYYY-MM-DD

    $("divContainer").hidden = false;
    $("txtNombre").value = nombre;
    $("selCuatrimestre").value = cuatrimestre;
    $("txtFecha").value = fecha;
    if(turno === "Mañana")
    {
        $("rbMañana").checked = true;
    }else{
        $("rbNoche").checked = true;
    }
}

function validateMateria(nombre, fecha, turno)
{
    var validEntry = true; //Si alguna entrada tiene error, se volverá false y no seguirá.
    if(nombre.length <= 6) //Check name
    {
        validEntry = false;
        $("txtNombre").className = "inputError";
    }
    if(Date.parse(fecha) < Date.now()){ //Check Date
        validEntry = false;
        $("txtFecha").className = "inputError";
    }    
    if(!turno) //If turno is empty, this will return false
    {
        validEntry = false;
    }

    return validEntry;
}

function deleteMateria()
{
    var id = listaJson[currentIndex].id;

    peticionHttp.onreadystatechange = respuestaPostDelete;
    peticionHttp.open("POST","http://localhost:3000/eliminar",true);
    peticionHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    
    peticionHttp.send("id="+id);    
}

function editMateria()
{
    var id = listaJson[currentIndex].id;
    var nombre = $value("txtNombre");
    var cuatrimestre = listaJson[currentIndex].cuatrimestre;
    var fecha = $value("txtFecha");    

    var turno;
    if($("rbMañana").checked == true)
    {
        turno = "Mañana";
    }else if($("rbNoche").checked == true){
        turno = "Noche";
    }

    if(validateMateria(nombre, fecha, turno))
    {
        var fechaArray = fecha.split("-");
        fecha = [fechaArray[2], fechaArray[1], fechaArray[0]].join("/"); //Change from YYYY-MM-DD to DD/MM/YYYY due to server format

        peticionHttp.onreadystatechange = respuestaPostEdit;
        peticionHttp.open("POST","http://localhost:3000/editar",true);
        peticionHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        
        peticionHttp.send("id="+id+"&nombre="+nombre+"&cuatrimestre="+cuatrimestre+"&fechaFinal="+fecha+"&turno="+turno);
    }
}

function modifyRow()
{
    var currentRow = $("tabMateriasBody").childNodes[currentIndex];

    var nombre = $value("txtNombre");
    var cuatrimestre = $value("selCuatrimestre");
    var fecha = $value("txtFecha");
    var fechaArray = fecha.split("-");
    fecha = [fechaArray[2], fechaArray[1], fechaArray[0]].join("/"); //Change from YYYY-MM-DD to DD/MM/YYYY

    var turno;
    if($("rbMañana").checked == true)
    {
        turno = "Mañana";
    }else if($("rbNoche").checked == true){
        turno = "Noche";
    }

    listaJson[currentIndex].nombre = nombre;
    listaJson[currentIndex].cuatrimestre = cuatrimestre;
    listaJson[currentIndex].fechaFinal = fecha;
    listaJson[currentIndex].turno = turno;

    //Change Nombre
    var currentCell = currentRow.childNodes[0];
    currentCell.childNodes[0].nodeValue = nombre;

    //Change Cuatrimestre
    var currentCell = currentRow.childNodes[1];
    currentCell.childNodes[0].nodeValue = cuatrimestre;

    //Change Fecha
    var currentCell = currentRow.childNodes[2];
    currentCell.childNodes[0].nodeValue = fecha;
    
    //Change Turno
    var currentCell = currentRow.childNodes[3];
    currentCell.childNodes[0].nodeValue = turno;
}

function respuestaPostDelete()
{
    if(validateRequest(peticionHttp) == 200)
    {
        $("divContainer").hidden = true;
        var respuesta = peticionHttp.responseText;
        respuesta = JSON.parse(respuesta);
        if(respuesta.type === "ok")
        {
            var currentRow = $("tabMateriasBody").childNodes[currentIndex];
            $("tabMateriasBody").removeChild(currentRow);
            listaJson.splice(currentIndex, 1);
        }        
        hideSpinner();
    }else if(validateRequest(peticionHttp) != 0 && validateRequest(peticionHttp) != 200)
    {
        alert("Error eliminando materia.");
        hideSpinner();
    }else
    {
        showSpinner();
    }
}

function respuestaPostEdit()
{
    if(validateRequest(peticionHttp) == 200)
    {
        $("divContainer").hidden = true;
        var respuesta = peticionHttp.responseText;
        respuesta = JSON.parse(respuesta);
        if(respuesta.type === "ok")
        {
            modifyRow();            
        }
        hideSpinner();
    }else if(validateRequest(peticionHttp) != 0 && validateRequest(peticionHttp) != 200)
    {
        alert("Error editando materia.");
        hideSpinner();
    }else
    {
        showSpinner();
    }
}