const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var http = require('http').createServer(app);

app.use(bodyParser.json()); 

const conn = mysql.createConnection({
  host     : 'xxxxxx',
  port     : xxxxxx,
  user     : 'xxxxxx',
  password : 'xxxxxx',
  database : 'xxxxxx'
});

function create(conn, dados, data){
	
	var sql = ''
	
	if(dados.protocolo){
		
	  sql = `
	  INSERT INTO pessoal 
	  
	  (
	  protocolo, 
	  tp_prot, 
	  datap,
	  dt_st_p,
	  tipo_matr, 
	  matric, 
	  nome, 
	  cic_cgc, 
	  rg, 
	  situacao, 
	  ato, 
	  seq, 
	  status_p,  
	  est_civ, 
	  nacional, 
	  profissao, 
	  dtinclusaoretro,
	  filiacao,
	  po
	  ) 
	  
	  VALUES 
	  
	  (
	  ${dados.protocolo}, 
	  'O', 
	  ${data}, 
	  ${data},
	  2, 
	  '${dados.matric}', 
	  '${dados.nome}', 
	  '${dados.cpf}', 
	  '${dados.rg}', 
	  '${dados.situacao}', 
	  1, 
	  '${dados.seq}', 
	  'R', 
	  '${dados.civil}', 
	  '${dados.nacional}', 
	  '${dados.profissao}', 
	  ${dados.data},
	  ' ',
	  ' '
	  )`;
		
	}else{
	
      sql = `
	  INSERT INTO pessoal 
	  
	  (
	  tp_prot, 
	  datap,
	  dt_st_p,
	  tipo_matr, 
	  matric, 
	  nome, 
	  cic_cgc, 
	  rg, 
	  situacao, 
	  ato, 
	  seq, 
	  status_p,  
	  est_civ, 
	  nacional, 
	  profissao, 
	  dtinclusaoretro,
	  filiacao,
	  po
	  ) 
	  
	  VALUES 
	  
	  (
	  'O', 
	  ${data}, 
	  ${data},
	  2, 
	  '${dados.matric}', 
	  '${dados.nome}', 
	  '${dados.cpf}', 
	  '${dados.rg}', 
	  '${dados.situacao}', 
	  1, 
	  '${dados.seq}', 
	  'R', 
	  '${dados.civil}', 
	  '${dados.nacional}', 
	  '${dados.profissao}', 
	  ${dados.data},
	  ' ',
	  ' '
	  )`;
	  
	}
      
      conn.query(sql, function (error, results){
          if(error) return console.log(error);
          console.log('Enviou a mat!');
          console.log(dados.protocolo);
      });
}

conn.connect(function(err){
  if(err) return console.log(err);
  console.log('conectou!');
})

app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.get('/ler', function(req, res){
	res.sendfile('read.html')
})

app.post('/db/matric/change', (req, res) => {
	
	req.body.situacao = req.body.situacao.toUpperCase()
	req.body.nome = req.body.nome.toUpperCase()
	req.body.dtinclusaoretro = req.body.dtinclusaoretro.replace('-', '')
	req.body.dtinclusaoretro = req.body.dtinclusaoretro.replace('-', '')
	
	console.log(req.body)

	let read = function(){
	  return new Promise(function(resolve, reject){
			sql = `
				UPDATE pessoal 
				SET cic_cgc = ${req.body.cic_cgc},
				nome='${req.body.nome}', 
				protocolo=${req.body.protocolo}, 
				rg=${req.body.rg}, 
				seq=${req.body.seq}, 
				situacao='${req.body.situacao}',
				dtinclusaoretro=${req.body.dtinclusaoretro}
				WHERE recno = ${req.body.recno}
			`
			conn.query(
			sql, 
			function(err, rows){                                                
				if(rows === undefined){
		 			reject(new Error("Error rows is undefined"));
				}else{
					resolve(rows);
					console.log('att')
				}
			}
		)}
	)}
	
	read().then( data => {
		res.end(JSON.stringify(data))
	})
	
})

app.post('/db/matric', async (req, res) => {
	//nome, cic_cgc, rg, situacao, seq, protocolo
	let read = function(){
	  return new Promise(function(resolve, reject){
		sql = `SELECT recno, nome, cic_cgc, rg, situacao, seq, protocolo, dtinclusaoretro from pessoal where matric = ${req.body.matric} and tipo_matr = 2 order by seq ASC, situacao, nome`
		conn.query(
			sql, 
			function(err, rows){                                                
				if(rows === undefined){
		 			reject(new Error("Error rows is undefined"));
				}else{
					resolve(rows);
				}
			}
		)}
	)}
	
	read().then( data => {
		res.end(JSON.stringify(data))
	})
	
})

app.get('/db/sit', function(req, res){
	
	let run = function(){
		resp = []
		return new Promise(function(resolve, reject){
			sql = 'SELECT situacao FROM situacao'
			sql2 = 'SELECT DISTINCT profissao FROM pessoal ORDER BY profissao ASC'
			sql3 = 'SELECT DISTINCT est_civ FROM pessoal'
			sql4 = 'SELECT DISTINCT nacional FROM pessoal'
			conn.query(sql, function (err, results){
				if(err) reject(new Error(err));
				resp = [...resp, results]
				conn.query(sql2, function (err2, results2){
					if(err2) reject(new Error(err2));
					resp = [...resp, results2]
					conn.query(sql3, function (err3, results3){
						if(err3) reject(new Error(err3));
						resp = [...resp, results3]
						resolve(resp)
					})	
				})
			})
		})
	}

	run().then(data => res.end(JSON.stringify(data)))
})

app.post('/db', (req, res) => {
				
	var date = new Date();
	var dia = date.getDate();
	var mes = date.getMonth()+1;
	var ano = date.getFullYear();
	var data = `${ano}${mes}${dia}`
	
	var size = Object.keys(req.body).length;
	for (obj in req.body){
		if (req.body[obj] == ''){
			req.body[obj] = ' '
		}
	}
	if (req.body.situacao != null){
		req.body.situacao = req.body.situacao.toUpperCase()
	}
	if (req.body.nome != null){
		req.body.nome = req.body.nome.toUpperCase()
	}
	if (req.body.protocolo == ' '){
		delete req.body['protocolo']
	}
	if (req.body.data != null){
		req.body.data = req.body.data.replace('-', '')
		req.body.data = req.body.data.replace('-', '')
	}

	console.log(req.body)
	
	create(conn, req.body, data)
	res.send(200)
});
  
http.listen(3000, function(){
  console.log('listening on *:3000');
});