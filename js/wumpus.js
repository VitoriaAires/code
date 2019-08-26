$(document).ready(function() {

	var casa_selecionada = null;
	let clicks = 0;
	let tabuleiro = new Array();
	let possivel_morte = new Array();
	let certeza_morte = new Array(); 
	let passos_possiveis = new Array();
	let passo_dados = new Array();
	let posicao_segura = new Array(); 
	let posicao = '0_0';
	let ultimaPosicao;
	let status = 'vivo';
	let alerta = new Map();
	let timer;


	// --------------- Montar Tabuleiro e add Monstro e Poços -----------------
	function montarTabuleiro(){
		var i;
		for (i=0; i<8; i++){
			$("#tabuleiro").append("<div id='linha_"+i.toString()+"' class='linha' >");
			tabuleiro[i] = new Array(8);       

			for (j=0; j<8; j++){
				var nome_casa =+i.toString()+"_"+j.toString();
				$("#linha_"+i.toString()).append("<div id='"+nome_casa+"' class='casa' />");
				casa = nome_casa.split("_");
				tabuleiro[casa[0]][casa[1]] = nome_casa;
			}
		}
		$("#0_0").addClass('heroi');
	}

	montarTabuleiro();

	function addSensor(p, classe){
		var linha = parseInt(p[0]);
		var coluna = parseInt(p[1]);
		
		if (linha-1 > -1 && $("#"+tabuleiro[p[0] - 1][p[1]]).attr('class') != 'casa poco'){
			$("#"+tabuleiro[p[0] - 1][p[1]]).addClass(classe);
			$("#"+tabuleiro[p[0] - 1][p[1]]).val('perigo');
		}
		if (coluna-1 > -1 && $("#"+tabuleiro[p[0]][p[1] - 1]).attr('class') != 'casa poco') {
			$("#"+tabuleiro[p[0]][p[1] - 1]).addClass(classe);
			$("#"+tabuleiro[p[0]][p[1] - 1]).val('perigo');
		}
		if (coluna+1 < 8 && $("#"+tabuleiro[p[0]][parseInt(p[1]) + 1]).attr('class') != 'casa poco') {
			$("#"+tabuleiro[p[0]][parseInt(p[1]) + 1]).addClass(classe);
			$("#"+tabuleiro[p[0]][parseInt(p[1]) + 1]).val('perigo');
		}
		if (linha+1 < 8 && $("#"+tabuleiro[parseInt(p[0]) + 1][p[1]]).attr('class') != 'casa poco') {
			$("#"+tabuleiro[parseInt(p[0]) + 1][p[1]]).addClass(classe);
			$("#"+tabuleiro[parseInt(p[0]) + 1][p[1]]).val('perigo');
		}
			if ($("#"+casa_selecionada).attr('class') == 'casa brisa') {
			$("#"+casa_selecionada).removeClass(classe)
		}	
	}

	$(".casa").click(function(){
			
		if (clicks <= 2) {
			casa_selecionada = $(this).attr("id");
			let p = casa_selecionada.split("_");
			addSensor(p, "brisa");
			$("#"+casa_selecionada).addClass("poco");
			$("#"+casa_selecionada).val("poco");
			clicks++;
		if (clicks == 3) {
			$('#inst_1').css('text-decoration', 'line-through');
		}
		} else if (clicks == 3) {
			casa_selecionada = $(this).attr("id");
			let p = casa_selecionada.split("_");
			addSensor(p, "odor");
			$("#"+casa_selecionada).addClass("wumpus");
			$("#"+casa_selecionada).val("wumpus");
			clicks++;
		if (clicks == 4)
			$('#inst_2').css('text-decoration', 'line-through');
		} else if (clicks == 4) {
			casa_selecionada = $(this).attr("id");
			$("#"+casa_selecionada).addClass("ouro");
			$("#"+casa_selecionada).val("ouro");
			clicks++;
		if (clicks == 5)
			$('#inst_3').css('text-decoration', 'line-through');
		}
	});
	// --------------- Fim -----------------

	function win()
	{
		alert('Voce venceu');
		status = 'vencedor';
		$('#tabuleiro').remove();
		clicks = 0;
		montarTabuleiro();
		status = 'vivo';
		play();
	}

	function die()
	{
		alert('Voce Morreu');
		status = 'morto';
		$('#tabuleiro').remove();
		clicks = 0;
		montarTabuleiro();
		status = 'vivo';
		play();
	}

	function addHeroi(posicao)
	{
		$('#tabuleiro div').removeClass('heroi');
		if ($('#' + posicao).attr('class') == 'casa brisa') {
			$('#' + posicao).removeClass('brisa');
		}
		if ($('#' + posicao).attr('class') == 'casa odor')
			$('#' + posicao).removeClass('odor');
		$('#' + posicao).addClass('heroi');
	}

	let posicao_removida;
	function removePerigo(posicao)
	{
		index = possivel_morte.indexOf(posicao);
		if (index > -1) {
			possivel_morte.splice(index, 1);

			posicao_removida = posicao;

			alerta.forEach(removerPerigoMap);
		}		
	}

	function removerPerigoMap(value, key){
		
		index = value.indexOf(posicao_removida);

		// Remove perigo da lista (alerta, Array possible_death)
		// alerta - brisas  
		if(index != -1 ){
			console.log(" posição removida " + posicao_removida);
			value.splice(index, 1);
			alerta.set(key, value);
		}

		// Adicionar em certeza_perigo caso tenha um alerta exclusiva 
		if(value.length == 1 && certeza_morte.indexOf(value[0]) == -1){
			certeza_morte.push(value[0]);
			$("#perigoConfirmado").append("<li>"+value[0]+"</li>");
		}
	}

	// Como a posição atual não tem um perigo (brisa ou odor) 
	// é possivel indentificar que as casas em volta desta posição são seguras
	// Portanto: add posição no array posicao_segura e removemos o perigo
	function setPosicaoSegura(posicao)
	{
		p = posicao.split("_");
		p[0] = parseInt(p[0]);
		p[1] = parseInt(p[1]);
		
		if (p[0] + 1 <= 7){
			posicao_segura.push((p[0] + 1) + "_" + p[1]);
			removePerigo((p[0] + 1) + "_" + p[1]);
		}
		if (p[0] - 1 >= 0){
			posicao_segura.push((p[0] - 1) + "_" + p[1]);
			removePerigo((p[0] - 1) + "_" + p[1]);
		}
		if (p[1] + 1 <= 7){
			posicao_segura.push(p[0] + "_" + (p[1] + 1));
			removePerigo(p[0] + "_" + (p[1] + 1));
		}
		if (p[1] - 1 >= 0){
			posicao_segura.push(p[0] + "_" + (p[1] - 1));
			removePerigo(p[0] + "_" + (p[1] - 1));
		}		
	}

	// Indentifica os passos possiveis 
	function setPassosPossiveis(posicao) {
		p = posicao.split("_");
		p[0] = parseInt(p[0]);
		p[1] = parseInt(p[1]);
		
		if (p[0] + 1 <= 7)
			passos_possiveis.push((p[0] + 1) + "_" + p[1])
		if (p[0] - 1 >= 0)
			passos_possiveis.push((p[0] - 1) + "_" + p[1])
		if (p[1] + 1 <= 7)
			passos_possiveis.push(p[0] + "_" + (p[1] + 1))
		if (p[1] - 1 >= 0)
			passos_possiveis.push(p[0] + "_" + (p[1] - 1))
	}

	function getOccurrence(array, value) {
		var count = 0;
		array.forEach((v) => (v === value && count++));
		return count;
	}

	// Indentifica quais são os possiveis Poços e Monstro  
	function setPerigos(posicao){ 

		p = posicao.split("_");
		p[0] = parseInt(p[0]);
		p[1] = parseInt(p[1]);
		var value;
		var temp = new Array();

		if (p[0] + 1 <= 7){
			value = (p[0] + 1) + "_" + p[1];
			if(posicao_segura.indexOf(value) == -1){
				temp.push(value);
				if(possivel_morte.indexOf(value) == -1){
					possivel_morte.push(value);
				}
			}
		}
			
		if (p[0] - 1 >= 0){
			value = (p[0] - 1) + "_" + p[1];
			if(posicao_segura.indexOf(value) == -1){
				temp.push(value);
				if(possivel_morte.indexOf(value) == -1){
					possivel_morte.push(value);
				}
			}
		}
			
		if (p[1] + 1 <= 7){
			value = p[0] + "_" + (p[1] + 1);
			if(posicao_segura.indexOf(value) == -1){
				temp.push(value);
				if(possivel_morte.indexOf(value) == -1){
					possivel_morte.push(value);
				}
			}
		}

		if (p[1] - 1 >= 0){
			value = p[0] + "_" + (p[1] - 1);
			if(posicao_segura.indexOf(value) == -1){
				temp.push(value);
				if(possivel_morte.indexOf(value) == -1){
					possivel_morte.push(value);
				}
			}
		}

		if(alerta.has(posicao) == false){
			alerta.set(posicao, temp);
		}

		// Adicionar em certeza_perigo caso tenha um alerta exclusiva 
		if(temp.length == 1 && certeza_morte.indexOf(temp[0]) == -1){
			certeza_morte.push(temp[0]);
			$("#perigoConfirmado").append("<li>"+temp[0]+"</li>");				
		}

	}

	function andar(posicao)
	{
		let score = new Array();
		let max = 0;
		let nova_posicao;
		$.each(passos_possiveis, function(index, p) {

			score[p] = 0;
			if (possivel_morte.indexOf(p) == -1) {
				if (posicao_segura.indexOf(p) != -1) {
					score[p] = score[p] + 1;
				}
				if (p != ultimaPosicao) {
					score[p] = score[p] + 2;
				}
				if (passo_dados.indexOf(p) == -1) {
					score[p] = score[p] + 3;
				}
			}
			max = score[p];
			nova_posicao = p;
		});

		passos_possiveis.forEach(function (index, value) {	
			if(score[index] > max){
				max = score[index];
				nova_posicao = index;
			}else if(score[index] == max){
				if(getOccurrence(passo_dados, nova_posicao) >= getOccurrence(passo_dados, index)){
					nova_posicao = index;
				}
			}	
		});
		ultimaPosicao = posicao;
		posicao = nova_posicao;
		addHeroi(posicao);
		passo_dados.push(nova_posicao);
		
		passos_possiveis.length = 0; //esvazia os passos possiveis
		
		return nova_posicao;
	}

	function play()
	{
		posicao = '0_0';
		ultimaPosicao = '';
		posicao_segura.length = 0;
		passo_dados.length = 0;
		passos_possiveis.length = 0;
		possivel_morte.length = 0;

		passo_dados.push(posicao);
		
		timer = setInterval(calcula, 250);	
	}

	$('#play').on('click', function(){
		play();
	});

	function calcula(){

		// se posição atual tem um perigo (brisa ou odor) 
		if($('#' + posicao).val() == 'perigo') {
			if(posicao_segura.indexOf(posicao) != -1 && certeza_morte.length != 4) {
				setPerigos(posicao);	
			}else if(certeza_morte.length == 4 && possivel_morte.length != 4){
				$.each(possivel_morte, function(index, p) {
					if(certeza_morte.indexOf(p) == -1){
						removePerigo(p);
					}
				});
				console.log("Perigo : " + possivel_morte);
			}
		} 
		else 
		{
			setPosicaoSegura(posicao);
		}
		setPassosPossiveis(posicao);
		posicao = andar(posicao);

		if ($('#' + posicao).val() == 'ouro') {				
			//win();
			status = "vencedor";
			alert('Voce venceu');
			clearInterval(timer);
		}
		if ($('#' + posicao).val() == 'wumpus' || $('#' + posicao).val() == 'poco'){
			//die();
			status = "morto";
			alert('Voce morreu');
			clearInterval(timer);
		}  
	}

})