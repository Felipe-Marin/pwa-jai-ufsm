import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { QuestionsPage } from './../questions/questions';
import { Trabalho } from '../../interfaces/trabalho';
import { Avaliacao, Estado } from '../../interfaces/avaliacao';
import { ApiUfsmProvider } from '../../providers/api-ufsm/api-ufsm';
import { LocalDataProvider } from '../../providers/local-data/local-data';
import { LoginPage } from '../login/login';

/**
 * Generated class for the TrabalhosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-trabalhos',
  templateUrl: 'trabalhos.html',
})
export class TrabalhosPage {

  public nome: string;
  public trabalhos: Array<Trabalho>;
  public estados: Array<string>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public apiUfsmProvider: ApiUfsmProvider,
    public localDataProvider: LocalDataProvider,
    private loadingCtrl: LoadingController
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrabalhosPage');
  }

  ngOnInit(){
    let loader = this.loadingCtrl.create({
      content: "Carregando...",
      duration: 10000
    });
    loader.present();
    /*this.apiUfsmProvider.getTrabalhos().subscribe(trabalhos => {
      this.trabalhos = trabalhos;
      this.localDataProvider.getEstados().then(estados => {
        this.estados = estados;
        loader.dismiss().catch(() => {});
      });
    });*/
    this.nome = this.navParams.get('nome');
    this.trabalhos = this.navParams.get('trabalhos');
    console.log(this.nome);
    console.log(this.trabalhos)
    let avaliacoes = new Array<Avaliacao>();
    for(let i = 0; i < this.trabalhos.length; i++){
      this.localDataProvider.getAvaliacao(this.trabalhos[i].id).then(avaliacao => {
        if(!avaliacao){
          let avaliacao = {
            trabalho: this.trabalhos[i].id,
            tituloTrabalho: this.trabalhos[i].titulo,
            avaliador: this.nome,
            estado: Estado["Não Avaliado"],
            respostas: new Array<string>(10)
          }
          avaliacoes.push(avaliacao);
        }
      });   
    }
    this.localDataProvider.setTrabalhos(this.trabalhos).then(()=>{
      this.localDataProvider.setAvaliacoes(avaliacoes).then(()=>{
        this.localDataProvider.getEstados().then(estados => {
          console.log(estados);
          this.estados = estados;
          loader.dismiss().catch(() => {});
        });
      });
    });
  }

  ionViewDidEnter(){
    this.localDataProvider.getEstados().then(estados => {
      this.estados = estados;
    });
  }

  goToQuestions(trabalho: Trabalho) {
    this.navCtrl.push(QuestionsPage, { trabalho: trabalho, avaliador: this.nome });
  }

  doLogout(){
    this.navCtrl.setRoot(LoginPage);
  }

}
