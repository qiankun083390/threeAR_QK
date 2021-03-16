class ThreeHelper {


    constructor() {
        this.mixers = [];

        /**
         * 创建场景对象Scene
         */
        this.scene = new THREE.Scene();
        //环境光
        this.scene.add(new THREE.AmbientLight(0xFFFFFF));

        /**
         * 相机设置 透视投影相机
         */
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0)); //设置相机方向(指向的场景对象)
        this.camera.position.set(-30, 30, 25);  //设置相机位置

         /**
         * 创建渲染器对象
         */
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
        this.renderer.setSize(window.innerWidth, window.innerHeight);//设置渲染区域尺寸
        this.renderer.domElement.setAttribute('class', 'mainCanvas');
        document.body.appendChild(this.renderer.domElement); //body元素中插入canvas对象


        // 创建一个时钟对象Clock
        this.clock = new THREE.Clock();

		// onresize 事件会在窗口被调整大小时发生
        window.addEventListener('resize', () => {
			// 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
            this.camera.aspect = window.innerWidth / window.innerHeight;
			
			// 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
		    // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
		    // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
			this.camera.updateProjectionMatrix();
			
		    // 重置渲染器输出画布canvas尺寸
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);


        this.control = new THREE.OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
        this.control.update();
        this.render();

    }

    /**
     * 渲染
     */
    render() {
        this.renderer.render(this.scene, this.camera); //执行渲染操作

        for (const mixer of this.mixers) {
             //clock.getDelta()方法获得两帧的时间间隔
             // 更新混合器相关的时间
            mixer.update(this.clock.getDelta());
        }
        window.requestAnimationFrame(() => {   //请求再次执行渲染函数render，渲染下一帧
            this.render();
        });
    }
	
	removeEntity(){
        if(this.scene.children.length > 1){
            var endElement = this.scene.children[this.scene.children.length - 1];
            this.scene.remove(endElement);
        }

    }
	
 
  /**
   * 加载模型
   * @param {} parameter {"model":"/trex/scene.gltf","scale":0.2,"position":[0, 0, 0],"rotation":[0, 0, 0]};
   */
    loadObject(parameter) {
        const loader = new THREE.FBXLoader();
        loader.load(parameter.model, (object) => {
            object.scale.setScalar(parameter.scale);
            object.position.set(parameter.position[0], parameter.position[1], parameter.position[2]);
            object.rotation.set(parameter.rotation[0], parameter.rotation[1], parameter.rotation[2]);
			
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.position.set(-30, 30, 25);

            this.mixers = [];
            this.control.update();
            this.render();

            this.scene.add(object);
            

            if (object.animations.length > 0) {
                object.mixer = new THREE.AnimationMixer(object); // object作为参数创建一个混合器，解析播放obj及其子对象包含的动画数据
                this.mixers.push(object.mixer);
                object.mixer.clipAction(object.animations[0]).play();   // object.animations[0]：获得剪辑对象clip

            }
        });
    }
}
