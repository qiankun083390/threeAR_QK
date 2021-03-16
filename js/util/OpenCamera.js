/**
 * 摄像头设置参数请查看： https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * 如果打开摄像头后，播放视频有卡顿，请尝试设置 frameRate，height与width
 */
 class OpenCamera {
    /**
     * @param interval 识别间隔(毫秒)
     */
    constructor(interval) {
 
        this.cameras = ["user", "environment"];  
        this.interval = interval;
		this.carema = [];

    }
    /**
     * 列表设备上的所有摄像头
     * @param videoDevice
     * @returns {Promise<T>}
     */
    listCamera(videoDevice) {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                let index = 0;
				console.info(devices);
                devices.find((device) => {
                    if (device.kind === 'videoinput') 
					
					{
						//console.info(device);
                        const option = document.createElement('option');
                        // 在iOS12.2上deviceId为空
                        if (device.deviceId == '') {
                            option.text = device.label || 'camera ' + this.cameras[index];
                            option.value = JSON.stringify({ audio: false, video: { facingMode: { exact: this.cameras[index] } } });
                            index++;
                        }
                        else {
                            option.text = device.label || 'camera ' + (videoDevice.length + 1).toString();
                            option.value = JSON.stringify({ audio: false, video: { deviceId: { exact: device.deviceId } } });
                        }
                        // 将摄像头信息存储在select元素中，方便切换前、后置摄像头
                        videoDevice.appendChild(option);
                    }
                    return false;
                });
                if (videoDevice.length === 0) {
                    reject('没有可使用的视频设备');
                }
                else {
                    this.initVideo();
                    this.initCanvas();
                    resolve(true);
                }
            }).catch(err => {
                reject(err);
            });
        });
		
			
    }
    /**
     * 打开摄像头
     * @param  front false后置，true前置
     * @param  isaudio false，true
     * @returns {Promise<T>}
     */
    openCamera(isaudio,front,camreass) {
        // 如果是切换摄像头，则需要先关闭。
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => {
                track.stop();
            });
        }
		let deviceId = "";
		if(camreass.length >2){
			deviceId = camreass[2];
		}else{
			deviceId = camreass[1];
		}
		
        let constraints = {audio: isaudio,video: {deviceId:deviceId,facingMode: (front? "user" : "environment") } };

        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                this.videoElement.srcObject = stream;
                this.videoElement.style.display = 'block';
                this.videoElement.play();
                this.videoElement.onloadedmetadata = () => {
                    const cameraSize = {
                        width: this.videoElement.offsetWidth,
                        height: this.videoElement.offsetHeight
                    };
                    console.info(JSON.stringify(cameraSize));
                    if (window.innerWidth < window.innerHeight) {
                        // 竖屏
                        if (cameraSize.height < window.innerHeight) {
                            this.videoElement.setAttribute('height', window.innerHeight.toString() + 'px');
                        }
                    }
                    else {
                        // 横屏
                        if (cameraSize.width < window.innerWidth) {
                            this.videoElement.setAttribute('width', window.innerWidth.toString() + 'px');
                        }
                    }
                    resolve(true);
                };
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * 截取摄像头图片
     * @returns {string}
     */
    captureVideo() {
        this.canvasContext.drawImage(this.videoElement, 0, 0, this.videoElement.offsetWidth, this.videoElement.offsetHeight);
        return this.canvasElement.toDataURL('image/jpeg', 0.5).split('base64,')[1];
    }
    /**
     * 创建视频详情元素，播放摄像头视频流
     */
    initVideo() {
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', 'playsinline');
        document.body.appendChild(this.videoElement);
    }

    /**
     * 创建canvas，截取摄像头图片时使用
     */
    initCanvas() {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.setAttribute('width', window.innerWidth.toString() + 'px');
        this.canvasElement.setAttribute('height', window.innerHeight.toString() + 'px');
        this.canvasContext = this.canvasElement.getContext('2d');
        // document.body.appendChild(this.canvasElement);
    }
  
}
