import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Keyboard, ToastController, AlertController } from 'ionic-angular';
import { Trabalho } from '../../interfaces/trabalho';
import { Pergunta, Perguntas } from '../../interfaces/pergunta';
import { Avaliacao, Estado } from '../../interfaces/avaliacao';
import { LocalDataProvider } from '../../providers/local-data/local-data';
import { ApiUfsmProvider } from '../../providers/api-ufsm/api-ufsm';

/**
 * Generated class for the QuestionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-questions',
  templateUrl: 'questions.html',
})
export class QuestionsPage {

  questions: Array<Pergunta>;
  avaliacao: Avaliacao;
  trabalho: Trabalho;
  rangeValue: number;
  radioValue: string;
  @ViewChild(Slides) slides: Slides;
  slidesIndex: number;
  slidesLength: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public keyboard: Keyboard, 
    private localDataProvider: LocalDataProvider, private apiUfsmProvider: ApiUfsmProvider, public alertCtrl: AlertController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuestionsPage');
  }

  ngOnInit(){
    if(this.navParams.data.trabalho){
      this.trabalho = this.navParams.data.trabalho;
      let avaliador = this.navParams.data.avaliador;
      if(this.trabalho.evento.includes('Fórum Extensão Conta')){
        this.questions = Perguntas.perguntasExt;
      }else{
        this.questions = Perguntas.perguntasIC;
      }
      this.slidesIndex = 1;
      this.slidesLength = this.questions.length + 2;
      this.initQuestions();
      this.avaliacao = {
        trabalho: this.trabalho.id,
        tituloTrabalho: this.trabalho.titulo,
        avaliador: avaliador,
        estado: Estado["Não Avaliado"],
        respostas: new Array<string>(this.questions.length)
      };
      this.localDataProvider.getAvaliacao(this.avaliacao.trabalho).then(avaliacao => {
        if(avaliacao){
          this.avaliacao = avaliacao;
        }
      });
    }

  }

  private initQuestions(){
    for(let i = 0; i < this.questions.length; i++){
      if(this.questions[i].discursiva == true){
        this.questions[i].tipo = 1;
      }
      else{
        this.questions[i].listaRespostas = this.questions[i].respostas.split(';');
        this.questions[i].tipo = this.getQuestionType(this.questions[i].listaRespostas);
      }
    }
  
  }

  private getQuestionType(listaRespostas: Array<string>){
    for(let i=0; i < listaRespostas.length; i++) {
      if(Number.isNaN(Number(listaRespostas[i]))){
        return 3;
      }else{
        return 2;
      }
    }
  }

  public setAvaliacao(){
    this.slides.getActiveIndex();
    console.log('setavaliacao');
    let respostasPendentes = 0;
    for(let i = 0; i < this.avaliacao.respostas.length; i++){
      if(this.avaliacao.respostas[i] == undefined){
        respostasPendentes += 1;
      }
    }
    if(respostasPendentes == 0){
      let prompt = this.showPromptAlert();
      prompt.present();
    }else{
      this.showAlert('Responda todas as perguntas', '');
    }
 
  }

  private presentToast(message: string){
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  showAlert(title: string, subtitle: string) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

  showPromptAlert(){
    let prompt = this.alertCtrl.create({
      title: "Avaliador",
      message: "Digite o nome de quem está fazendo a avaliação",
      inputs: [
        {
          name: 'nome',
          placeholder: 'Nome'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Confirmar',
          handler: data => {
            console.log('Confirmado');
            if(data.nome && data.nome.length > 0){
              this.avaliacao.avaliadorReal = data.nome;
              this.apiUfsmProvider.setAvaliacao(this.avaliacao).then(()=> {
                this.presentToast('Avaliação enviada com sucesso.');
                this.navCtrl.pop();
              }, err => {
                this.presentToast('Não foi possível enviar a avaliação. Uma nova tentativa de envio será feita automaticamente quando houver conexão a internet.');
                this.navCtrl.pop();
              });
            }else{
              this.presentToast('Nome inválido');
            }
          }
        }
      ]
    });
    return prompt;
  }

  public slidesBack(){
    this.slides.slidePrev();
  }

  public slidesForward(){
    this.slides.slideNext();
  }

  public slideTo(index: number){
    this.slides.slideTo(index + 1);
  }

  public slideChanged(){
    this.slidesIndex = this.slides.getActiveIndex() + 1;
  }

}