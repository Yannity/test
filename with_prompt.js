(function() {
  let running = true;
  const run = async (link) => {
    const cells = [
      ...document
      .querySelector('.ContributionCalendar-grid')
      .querySelectorAll('tbody tr')
    ].map(row => row.querySelectorAll(
      'td:not(.ContributionCalendar-label)'
    ));
    const response = await fetch(link);
    const frame_json = await response.text();
    const frame_data = JSON.parse(
      frame_json,
      (_, value) => typeof value === 'string' ? BigInt(value) : value
    )
   
    window.__stop?.();
    window.__stop = () => {running = false};
    play(frame_data, cells) ;
  }

  const play = (frames, cells) => {
    let frame_idx = 0;
    const update = () => {
      if(running) requestAnimationFrame(update);
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


  const prompt_user = async () => {
    const response = await fetch('https://api.github.com/repos/Yannity/test/contents/animations/')
    const result = await response.json();

    const choices = Object.fromEntries(
      result
        .filter(({name}) => name.endsWith('.dat'))
        .map(({name, download_url}, idx) => [
        idx+1,
        {
          name: name.replaceAll('_', ' ').split('.').slice(0, -1).join('.'),
          download_url,
        }
      ])
    )

    const user_input = prompt([
      ...Object
      .entries(choices)
      .map(([k, {name}]) => `${k}: ${name}`),
      'or custom link'
    ].join('\n'))

    if(user_input) {
      const file = choices[parseInt(user_input.trim(), 10)]
      const link = file
        ? file.download_url
        : user_input.trim();
      run(link)
    }
  }

  prompt_user();

})();
