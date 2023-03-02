# VPNConnect
GUI VPN Linux


Para Instalar
``` yarn install ```

Para gerar .deb
```yarn dist:linux ```


## Como utilizar

- Instale o arquivo .deb gerado na build ou baixado do github em releases
- Crie uma pasta chamada VPNConfig em /Documents
- Coloque os arquivos **.key**, **.ovpn** e **.p12** na pasta criada
- Crie um arquivo chamado **pass.txt** com seu usuário na primeira linha e a sua senha na segunda
- Altere seus arquivos **.ovpn** e adicione uma linha com a instrução ```auth-user-pass pass.txt```
- Inicie o programa
- Selecione uma configuração
- Clique em **Conectar**



## Error conhecidos

- Se apresentar o erro "Need executable 'ar' to convert dir to deb" você precisa instalar binutils

```sudo apt-get install binutils ```


