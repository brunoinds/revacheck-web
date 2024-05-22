<template>
    <ion-page>
        <ion-header>
        <ion-toolbar>
            <ion-title>✅ RevaCheck</ion-title>
        </ion-toolbar>
        </ion-header>
        <ion-content>
            <article class="main">
                <header>
                    
                </header>
                <main>
                    <ion-list>
                        <ion-item>
                            <ion-input label="Email" label-placement="floating" placeholder="Coloque seu email aqui"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-input label="Senha" label-placement="floating" placeholder="Digite sua senha aqui"></ion-input>
                        </ion-item>
                    </ion-list>
                </main>
                <footer>
                    <ion-button>Fazer login</ion-button>
                    <ion-button>Cadastrar-me</ion-button>
                </footer>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonList, IonItem, IonInput, IonTitle, IonContent, IonButton, IonIcon, IonLabel, alertController } from '@ionic/vue';
import { medicalOutline, checkmarkDoneOutline, arrowForwardOutline, radioOutline, codeWorkingOutline, shareOutline, peopleCircleOutline, cloudUploadOutline, closeOutline, playOutline, timeOutline, sendOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';


const router = useRouter();

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
