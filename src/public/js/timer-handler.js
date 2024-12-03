class TimerHandler {
    constructor(socketHandler) {
      this.socketHandler = socketHandler;
      this.progressBar = document.getElementById('auction-progress');
      this.countdownDisplay = document.getElementById('countdown-display');
      this.progressInterval = null;
      this.countdownInterval = null;
      this.progress = 100;
      this.countdown = null;
      
      this.setupListeners();
    }
  
    setupListeners() {
      this.socketHandler.on('timer-sync', (data) => {
        this.syncTimer(data.progress);
      });
  
      this.socketHandler.on('auction-end', (data) => {
        this.handleAuctionEnd(data);
      });
    }
  
    startTimer() {
      this.progress = 100;
      this.clearIntervals();
      
      this.progressInterval = setInterval(() => {
        this.progress -= (100 / 300); // 30 seconds
        this.updateProgress();
        
        if (this.progress <= 50 && !this.countdown) {
          this.startCountdown();
        }
        
        if (this.progress <= 0) {
          this.handleTimerEnd();
        }
      }, 100);
    }
  
    syncTimer(serverProgress) {
      this.progress = serverProgress;
      this.updateProgress();
      
      if (this.progress <= 50) {
        this.startCountdown();
      }
    }
  
    updateProgress() {
      if (this.progressBar) {
        this.progressBar.style.width = `${Math.max(0, this.progress)}%`;
      }
    }
  
    startCountdown() {
      this.countdown = 3;
      this.updateCountdown();
      
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        this.updateCountdown();
        
        if (this.countdown <= 0) {
          clearInterval(this.countdownInterval);
          this.countdown = null;
        }
      }, 1000);
    }
  
    updateCountdown() {
      if (this.countdownDisplay) {
        this.countdownDisplay.textContent = this.countdown;
        this.countdownDisplay.style.display = this.countdown ? 'block' : 'none';
      }
    }
  
    handleTimerEnd() {
      this.clearIntervals();
      this.socketHandler.emit('timer-end');
    }
  
    handleAuctionEnd(data) {
      this.clearIntervals();
      Swal.fire({
        title: '¡Subasta Finalizada!',
        text: `La oferta ganadora es: S/. ${data.finalBid.toLocaleString()}`,
        icon: 'success'
      });
    }
  
    clearIntervals() {
      if (this.progressInterval) clearInterval(this.progressInterval);
      if (this.countdownInterval) clearInterval(this.countdownInterval);
    }
  
    reset() {
      this.clearIntervals();
      this.startTimer();
    }
  }
  
  export default TimerHandler;