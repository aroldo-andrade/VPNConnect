
let spawn = require('child_process').spawn;
let exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
var files = []
var selectedFileIndex = -1
var loopCheck = false;
var vpnStatus = false;

var btnConfig = document.querySelector('#btnConfig')
var divErro = document.querySelector('#erro')
var selectConfig = document.querySelector('#selectConfig')
var conectar = document.querySelector('#conectar')
var statusIcon = document.querySelector('#statusIcon')
var firstLine = document.querySelector('#firstLine')
var terminal = document.querySelector('#terminal')
var terminalLines = document.querySelector('#terminalLines')
var forceDesconect = document.querySelector('#forceDesconect')

var openVpn
var lang = navigator.language;
var configFolder = path.resolve(homedir,lang === 'en-US'?'Documents':'Documentos','VPNConfig')

firstLine.innerHTML = __dirname

try {

    let dirCont = fs.readdirSync(configFolder);
    files = dirCont.filter(f => f.match(/.*\.(ovpn)/ig))
    selectConfig.innerHTML = ['<option value="-1">Selecione uma configuração</option>', ...files.map((m, i) => `<option value='${i}'>${m.split('.')[0]}</option>`)]

} catch (error) {
    console.log(error)
    divErro.innerHTML = 'erro ao ler os arquivos de configuração.'
    divErro.classList.remove("hd")
    setTimeout(() => {
        divErro.classList.add("hd")
    }, 3000);
}

selectConfig.addEventListener('change', function (e) {
    selectedFileIndex = e.target.value
})
loopCheck = true;
tryConnect = false;
startCheckConnection();


conectar.addEventListener('click', function (e) {
    e.preventDefault()
        
        if(!vpnStatus && selectedFileIndex >= 0){
            tryConnect = true;
            openVpn = spawn(`/usr/bin/pkexec`,[` --disable-internal-agent /bin/bash -c "echo SUDOPROMPT; cd ${configFolder}; openvpn --config ${files[selectedFileIndex]}"`],{
                shell:true
            });
            
            openVpn.stdout.on('data', function (data) {
                console.log('stdout: ' + data.toString());
                terminalLines.innerHTML += `<p> ${data.toString()} </p>`
                terminal.scrollTop = terminal.scrollHeight;

            });
            
            openVpn.stderr.on('data', function (data) {
                console.log('stderr: ' + data.toString());
            });
            
            openVpn.on('exit', function (code) {
                console.log('child process exited with code ' + code.toString());
            });
            
            
            
        }else if(vpnStatus){
            disconect()
        }
    

})

function disconect(){
    console.log('vou desconectar')
    //ps -a -u root | grep -e 'openvpn' | cut -c 3-7
    let ps = spawn(`ps`,[`-a -u root | grep -e 'openvpn' | cut -c1-8 || echo '-1'`],{
        shell:true
    });
    ps.stdout.on('data', function (data) {
        console.log(data.toString())
        let str = data.toString();
        if(str){
            let comando = `kill ${str}`  
            console.log('comando: ',comando)
            if(comando)
               killProcess(comando)
        }

    });
    ps.stderr.on('data', function (data) {
        console.log('ps stderr: ' + data.toString());
    });
    ps.on('exit', function (code) {
        console.log('ps child process exited with code ' + code.toString());
    });
}

function killProcess(exec){

    let kill = spawn(`/usr/bin/pkexec`,[`--disable-internal-agent /bin/bash -c "echo SUDOPROMPT; ${exec}"`],{
        shell:true
    });
    
    kill.stdout.on('data', function (data) {
        tryConnect = false;
        console.log('killProcess stdout: ' + data.toString());
    });
    
    kill.stderr.on('data', function (data) {
        console.log('killProcess stderr: ' + data.toString());
    });
    
    kill.on('exit', function (code) {
        console.log('killProcess child process exited with code ' + code.toString());
    });

}

function setDisableConectarBtn(status) {
    conectar.setAttribute('disabled', status)
}

function markStatus(status) {
    vpnStatus = status;
    if (status) {
        console.log('conectado')
        tryConnect = false;
        statusIcon.classList.remove('disconnected')
        statusIcon.classList.add('connected')


        conectar.classList.remove('btn-primary')
        conectar.classList.remove('btn-danger')
        conectar.classList.add('btn-danger')
        conectar.innerHTML = 'Desconectar';

    } else {
        console.log('desconectado')
        statusIcon.classList.remove('connected')
        statusIcon.classList.add('disconnected')


        conectar.classList.remove('btn-primary')
        conectar.classList.remove('btn-danger')
        conectar.classList.add('btn-primary')
        conectar.innerHTML = 'Conectar';
    }
    if(tryConnect){
        conectar.innerHTML = 'Conectando...';
        conectar.setAttribute("disabled", "true"); 
    }else{
        conectar.removeAttribute("disabled")
    }
}

function startCheckConnection() {

    let nmcli = spawn(`nmcli`, ['con show --active | grep -i tun0 || echo "-1"'], {
        shell: true
    });



    nmcli.stdout.on('data', function (data) {
        //console.log('stdout: ' + data.toString());
        markStatus(data.toString().trim() != '-1')

    });

    nmcli.stderr.on('data', function (data) {
        //console.log('stderr: ' + data.toString());
        markStatus(false)
    });

    nmcli.on('exit', function (code) {
        //console.log('child process exited with code ' + code.toString());
        if (loopCheck) {
            setTimeout(() => {
                startCheckConnection()
            }, 1000);
        }
    });



}

btnConfig.addEventListener('click', function () {

    let xdg = exec(`xdg-open ${configFolder}`,function(error){
        if(error){

            divErro.innerHTML = 'erro ao abrir a pasta de configuração em: '+configFolder
            divErro.classList.remove("hd")
            setTimeout(() => {
                divErro.classList.add("hd")
            }, 3000);

        }
    })
})


forceDesconect.addEventListener('click', function () {    
    disconect()
})


