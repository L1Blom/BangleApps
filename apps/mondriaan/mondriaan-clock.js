// Inspired by Berlin Clock see https://en.wikipedia.org/wiki/Mengenlehreuhr
// https://github.com/eska-muc/BangleApps
// But the code is heavily changed to reflect my own ideas
//
const fields = [2, 4, 3, 4, 3, 5];
const rows = 6;
const offset = 16;
const width = g.getWidth() - 2 * offset;
const height = g.getHeight() - 2 * offset;
const rowHeight = height / rows;
console.log(width+" "+height+" "+rowHeight);

var show_date = false;
var show_time = true;
var yy = 0;

var rowlights = [];
var time_digit = [];

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  g.reset().clearRect(0,24,g.getWidth(),g.getHeight());
  var now = new Date();

  // show date below the clock
  if (show_date) {
    var yr = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var dateString = `${yr}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    var strWidth = g.stringWidth(dateString);
    g.setColor(g.theme.fg).setFontAlign(-1,-1);
    g.drawString(dateString, ( g.getWidth() - strWidth ) / 2, height + offset + 4);
  }

//  rowlights[0] = Math.floor(now.getHours() / 5);
//  rowlights[1] = now.getHours() % 5;
//  rowlights[2] = Math.floor(now.getMinutes() / 5);
//  rowlights[3] = now.getMinutes() % 5;

// 20:09 - all array elements start with 0
  rowlights[0] = Math.floor(now.getHours() / 12);       // 1
  rowlights[1] = Math.floor((now.getHours() % 12) % 3); // 3
  rowlights[2] = now.getHours() % 3;                    // 2
  rowlights[3] = Math.floor(now.getMinutes() / 15);     // 0
  rowlights[4] = Math.floor(now.getMinutes() / 5) % 3;  // 1 
  rowlights[5] = now.getMinutes() % 5;                  // 4
  
  console.log(rowlights[0]+" "+rowlights[1]+" "+rowlights[2]+" "+rowlights[3]+" "+rowlights[4]+" "+rowlights[5]);

  time_digit[0] = Math.floor(now.getHours() / 10);
  time_digit[1] = now.getHours() % 10;
  time_digit[2] = Math.floor(now.getMinutes() / 10);
  time_digit[3] = now.getMinutes() % 10;

  g.drawRect(offset, offset, width + offset, height + offset);
  for (row = 0; row < rows; row++) {
    nfields = fields[row];
    boxWidth = width / nfields;

    for (col = 0; col < nfields; col++) {
      x1 = col * boxWidth + offset;
      y1 = row * rowHeight + offset;
      x2 = (col + 1) * boxWidth + offset;
      y2 = (row + 1) * rowHeight + offset;

      g.setColor(g.theme.fg).drawRect(x1, y1, x2, y2);
      if (col <= rowlights[row]) {
        g.setColor(1, 0, 0);
        g.fillRect(x1 + 1, y1 + 1, x2 - 1, y2 - 1);
      }
      if (row == 3 && show_time) {
        g.setColor(g.theme.fg).setFontAlign(0,0);
        g.setFont("Vector:12");
        g.drawString(time_digit[col],(x1+x2)/2,(y1+y2)/2);
      }
    }
  }

  queueDraw();
}

function toggleDate() {
  show_date = ! show_date;
  draw();
}

function toggleTime() {
  show_time = ! show_time;
  draw();
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when button pressed, handle up/down
Bangle.setUI("clockupdown", dir=> {
  if (dir<0) toggleTime();
  if (dir>0) toggleDate();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
