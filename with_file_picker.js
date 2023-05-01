(function() {

  const play = (frames, cells) => {
    let frame_idx = 0;
    const update = () => {
      requestAnimationFrame(update);
      const frame = frames[frame_idx];
      frame_idx = (frame_idx + 1) % frames.length;
      for(let row = 0; row < cells.length; row++) {
        for(let col = 0; col < cells[row].length; col++) {
          const idx = row * cells[row].length + col;
          const bit = Number((frame >> BigInt(idx)) & 1n);
          const css_color = bit ? 'white' : 'black';
          cells[row][col].style.backgroundColor = css_color;
        }
      }
    }
    update();
  }

  const run = async (frame_data) => {
    const cells = [
      ...document
      .querySelector('.ContributionCalendar-grid')
      .querySelectorAll('tbody tr')
    ].map(row => row.querySelectorAll(
      'td:not(.ContributionCalendar-label)'
    ));
    window.__stop?.();
    window.__stop = () => {running = false};
    play(frame_data, cells) ;
  }


  const prompt_user = () => {
    const file_input = document.createElement('input');
    file_input.type = 'file';
    file_input.click();
    file_input.onchange = () => {
      const file = file_input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
          const frame_json = evt.target.result;
          const frame_data = JSON.parse(
            frame_json,
            (_, value) => typeof value === 'string' ? BigInt(value) : value
          )
          console.log({frame_data});
          run(frame_data)
        }
      }
    }
  }

  prompt_user();

})();
