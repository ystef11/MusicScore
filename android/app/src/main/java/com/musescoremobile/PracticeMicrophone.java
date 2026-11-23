package com.musescoremobile;

import android.Manifest;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/** Local monophonic pitch monitor. It does not fabricate score-assessment results. */
final class PracticeMicrophone implements LifecycleEventListener {
    private final ReactApplicationContext context;
    private volatile boolean running;
    private Thread worker;
    PracticeMicrophone(ReactApplicationContext context) { this.context=context; context.addLifecycleEventListener(this); }
    synchronized void start(Promise promise) {
        if (running) { promise.resolve(null); return; }
        if (worker != null && worker.isAlive()) { promise.reject("MIC_BUSY", "Микрофон завершает предыдущую сессию. Повторите нажатие."); return; }
        if (context.checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED) {
            promise.reject("MIC_PERMISSION", "Разрешите доступ к микрофону."); return;
        }
        try {
            final int rate=22050;
            int size=Math.max(8192,AudioRecord.getMinBufferSize(rate,AudioFormat.CHANNEL_IN_MONO,AudioFormat.ENCODING_PCM_16BIT));
            final AudioRecord recorder=new AudioRecord(MediaRecorder.AudioSource.UNPROCESSED,rate,AudioFormat.CHANNEL_IN_MONO,AudioFormat.ENCODING_PCM_16BIT,size);
            if(recorder.getState()!=AudioRecord.STATE_INITIALIZED) { recorder.release(); throw new IllegalStateException("Не удалось открыть микрофон"); }
            try { recorder.startRecording(); } catch(Exception error) { recorder.release(); throw error; }
            if(recorder.getRecordingState()!=AudioRecord.RECORDSTATE_RECORDING) { recorder.release(); throw new IllegalStateException("Микрофон занят другим приложением"); }
            running=true;
            worker=new Thread(()->{
                short[] frame=new short[2048];
                try {
                    while(running){
                        int count=0;
                        while(running&&count<frame.length){int n=recorder.read(frame,count,frame.length-count);if(n<=0)throw new IllegalStateException("Ошибка чтения микрофона: "+n);count+=n;}
                        if(running)publish(frame,rate);
                    }
                } catch(Exception error){if(running){WritableMap data=Arguments.createMap();data.putString("error",error.getMessage());emit(data);}}
                finally { running=false; try{recorder.stop();}catch(Exception ignored){} recorder.release(); }
            },"MusicScoreMicrophone");
            worker.start();promise.resolve(null);
        } catch(Exception error){running=false;promise.reject("MIC_START",error.getMessage(),error);}
    }
    private void publish(short[] frame,int rate){
        double energy=0,mean=0; for(short sample:frame)mean+=sample;mean/=frame.length;
        for(short sample:frame){double v=(sample-mean)/32768.0;energy+=v*v;}
        double rms=Math.sqrt(energy/frame.length),frequency=0,confidence=0;
        // Difference-function pitch detection; select the first reliable minimum (avoid octave multiples).
        if(rms>0.003){
            double[] difference=new double[551];double cumulative=0;int lag=-1;
            for(int tau=1;tau<difference.length;tau++){
                double sum=0;for(int i=0;i<1024;i++){double delta=frame[i]-frame[i+tau];sum+=delta*delta;}
                cumulative+=sum;difference[tau]=cumulative>0?sum*tau/cumulative:1;
                if(tau>20&&difference[tau-1]<0.15&&difference[tau]>difference[tau-1]){lag=tau-1;break;}
            }
            if(lag>0){double offset=0;double denominator=difference[lag-1]-2*difference[lag]+difference[lag+1];if(denominator!=0)offset=(difference[lag-1]-difference[lag+1])/(2*denominator);frequency=rate/(lag+Math.max(-0.5,Math.min(0.5,offset)));confidence=1-difference[lag];}
        }
        WritableMap data=Arguments.createMap();data.putDouble("frequency",frequency);data.putDouble("level",rms);data.putDouble("confidence",confidence);emit(data);
    }
    private void emit(WritableMap data){if(context.hasActiveReactInstance())context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("MusicScoreMicrophone",data);}
    void stop(){running=false;}
    public void onHostPause(){stop();} public void onHostDestroy(){stop();} public void onHostResume(){}
}
