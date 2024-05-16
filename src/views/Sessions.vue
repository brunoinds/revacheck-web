<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>✅ RevaCheck</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :scroll-y="false">
      <article>
        <header>
          <h1>Selecione que tipo de papel você quer fazer:</h1>
        </header>
        <main>
          <ion-button @click="actions.chooseActor">
            <ion-icon slot="start" :icon="peopleCircleOutline" />
            <ion-label>Ator</ion-label>
          </ion-button>
          <ion-button @click="actions.chooseDoctor">
            <ion-icon slot="start" :icon="medicalOutline" />
            <ion-label>Médico</ion-label>
          </ion-button>
        </main>
      </article>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonLabel, alertController } from '@ionic/vue';
import { medicalOutline, checkmarkDoneOutline, arrowForwardOutline, radioOutline, codeWorkingOutline, shareOutline, peopleCircleOutline, cloudUploadOutline, closeOutline, playOutline, timeOutline, sendOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';


const router = useRouter();

const actions = {
  chooseDoctor: () => {
    alertController.create({
      header: 'Ingresse o código da estação',
      message: 'Insira o código que o ator da estação lhe forneceu:',
      inputs: [
        {
          name: 'code',
          type: 'number',
          placeholder: 'Código da estação'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ingressar',
          handler: (data) => {
            if(data.code){
              router.push(`/sessions/${data.code}?role=doctor`)
            }
          }
        }
      ]
    }).then((alert) => {
      alert.present().then(() => {
        
      })
    })
  },
  chooseActor: () => {
    //Generate random 8 numeric digits:
    const roomCode = Math.floor(10000000 + Math.random() * 90000000);
    
    router.push(`/sessions/${roomCode}`)
  }
}
</script>


<style scoped lang="scss">

article{
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center;
  position: absolute; 
  top: 0; left: 0; bottom: 0; right: 0;
}

</style>
