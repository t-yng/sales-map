class Product {

  private movePath

  public constructor(origin, destination) {
    // this.movePath = new Path(origin, destination)
  }

  public startAnimation(stage, fps = 60) {
   setTimeout(() => this.movePath.startAnimation(stage, fps), 800)

   let t = 0
   const timer = setInterval(() => {
     t += 0.01

   }, 1000 / fps)
  }
}