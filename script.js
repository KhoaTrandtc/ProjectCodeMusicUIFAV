/* 
1, render song 
2, scroll top
3, Play / pause / seek
4, CD rotate
5, Next / prev
6, random
7, Next / repeat when ended
8, Active song
9, Scroll active song into view
10, Play song when click

*/

// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);


const PLAYER_STORAGE_KEY ='F8_PLAYER'

const cd = $('.cd');
const player = $('.player')
const playBtn = $('.player .btn-toggle-play')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [

    {
      name: "Angel",
      singer: "NLE Choppa, Kodak Black, Jimin of BTS, JVKE, & Muni Long",
      path:
        "./music/angel.mp3",
      image:
        "./image/angel1.jpg"
    },
    {
      name: "Cupid",
      singer: "FIFTY FIFTY",
      path:
        "./music/cupid.mp3",
      image: "./image/cupid.jpg"
    },
    {
      name: "What it is",
      singer: "Doechii",
      path:
        "./music/whatitis.mp3",
      image:
        "./image/whatitis.jpg"
    },
    {
      name: "MAKING MY WAY",
      singer: "Sơn Tùng M-TP",
      path:
        "./music/makingmyway.mp3",
      image:
        "./image/makingmyway.jpg"
    },
    {
      name: "Golden hour",
      singer: "JVKE",
      path:
        "music/goldenhour.mp3",
      image:
        "image/goldenhour.jpg"
    },
    {
      name: "Comethru",
      singer: "Jeremy Zucker",
      path:
        "music/comethru.mp3",
      image:
        "image/comethru.jpg"
    }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.getItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
      <div  class="song ${index === this.currentIndex ? 'active' : ''}"  data-index="${index}">
        <div class="thumb" style="background-image: url('${song.image}')">
        </div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
      `;
    });
    $('.playlist').innerHTML = htmls.join('');
  },
    defineProperties: function() {
        let currentIndex = 0;

        Object.defineProperty(this, 'currentIndex', {
          get: function() {
            return currentIndex;
          },
          set: function(value) {
            currentIndex = value;
          }
        });
      
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })

  },
    handleEvents: function() {
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay / dừng 
    const cdThumbAnimate = cdThumb.animate([
        { transform: 'rotate(360deg)'}
    ], {
        duration: 10000, // 10 seconds
        iterations: Infinity
    })

    cdThumbAnimate.pause()


    //Xử lý phóng to / thu nhỏ CD
    document.onscroll = function() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrollTop

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      cd.style.opacity = newCdWidth / cdWidth
    }

        // Xử lí khi click play
        playBtn.onclick = function() {
            if (audio.paused) {
                audio.play()
            } else {
                audio.pause()
            }
        }

        // Khi song được play
        audio.onplay = function() {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // Khi song bị pause
        audio.onpause = function() {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) 
                progress.value = progressPercent 
            }
            
        }
        
        // Xử lí khi tua song
        progress.oninput = function(e) {
            const seekTime = (audio.duration / 100) * e.target.value
            audio.currentTime = seekTime    
        },


        // Khi next song 
        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong()
            } else {
                app.nextSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        // Khi prev song 
        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandomSong()
            } else {
                app.prevSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        // Xử lí bật / tắt random song 
        randomBtn.onclick = function(e) {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
            
        }

        // Xử lí lặp lại một song
        repeatBtn.onclick = function(e) {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // Xử lí next song khi audio ended  
        audio.onended = function() {
            if(app.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }

        }

        // Lắng nghe hành vi click vào playlist 
        playlist.onclick = function (e) {
          const songNode = e.target.closest('.song:not(.active)');
        
          if (songNode || e.target.closest('.option')) {
            // Xử lí khi click vào song 
            if (songNode) {
              app.currentIndex = Number(songNode.dataset.index);
              app.loadCurrentSong();
              audio.play();
              app.render();
            }
        
            // Xử lí khi click vào option
            if (e.target.closest('.option')) {
        
            }
          }
        }
        
        
        
        
        
        
        

     



  },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 500)
    },

    loadCurrentSong: function() { 
        

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')` 
        audio.src = this.currentSong.path
  },
    loadConfig: function() {
            this.isRandom = this.config.isRandom
            this.isRepeat = this.config.isRepeat
        },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * app.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong();
    },
    
    start: function() {
    // Gán cấu hình từ config vào ứng dụng 
    this.loadConfig()


    // Định nghĩa các thuộc tính cho object
    this.defineProperties()
    
    // Lắng nghe / xử lý các sự kiện (DOM event)
    this.handleEvents()    


    // Tải thông tin bài hát đầu tiên vaof UI khi chạy ứng dụng 
    this.loadCurrentSong()

    // Render playlist 
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random 
    randomBtn.classList.toggle('active', app.isRandom)
    repeatBtn.classList.toggle('active', app.isRepeat)
  }
};

app.start();