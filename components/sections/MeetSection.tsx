export default function MeetSection() {
  return (
    <section
      className="relative h-[80vh] flex items-center justify-center text-center text-white"
      id="meet"
    >
      <img
        src="/img/banner-bg.jpg"
        alt="Google Meet background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80"></div>

      <div className="relative z-10 px-6">
        <div className="flex justify-center mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg"
            alt="Google Meet"
            className="h-8 w-16"
          />
        </div>

        <h2 className="text-6xl font-extrabold mb-4">24/7 Active</h2>
        <p className="text-2xl font-medium mb-2">Google Meet Study Room.</p>
        <p className="text-lg opacity-90">(So join any time, be it in day or night.)</p>
      </div>
    </section>
  )
}

