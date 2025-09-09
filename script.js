// Static demo script that reads ThingSpeak public channel and plots Chart.js
const CHANNEL = '3030804';
const READ_KEY = '0BKCRB253T53P46X'; // public read key provided earlier
const RESULTS = 20;
const API_URL = `https://api.thingspeak.com/channels/${CHANNEL}/feeds.json?api_key=${READ_KEY}&results=${RESULTS}`;

let chart = null;

async function fetchThingSpeak() {
  try {
    const r = await fetch(API_URL);
    const json = await r.json();
    const feeds = json.feeds || [];
    const times = feeds.map(f => new Date(f.created_at).toLocaleString());
    const temp = feeds.map(f => parseFloat(f.field1) || null);
    const hum = feeds.map(f => parseFloat(f.field2) || null);

    document.getElementById('lastUpdate').textContent = feeds.length ? new Date(feeds[feeds.length-1].created_at).toLocaleString() : '—';

    const ctx = document.getElementById('tsChart').getContext('2d');
    if(!chart) {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: times,
          datasets: [
            { label: 'Temperatura (°C)', data: temp, borderColor: '#d9534f', tension:0.25, fill:false },
            { label: 'Umidade (%)', data: hum, borderColor: '#1f77b4', tension:0.25, fill:false }
          ]
        },
        options: { responsive:true, maintainAspectRatio:false, scales:{ x:{display:true}, y:{display:true} } }
      });
    } else {
      chart.data.labels = times;
      chart.data.datasets[0].data = temp;
      chart.data.datasets[1].data = hum;
      chart.update();
    }
  } catch (err) {
    console.error('TS error', err);
    document.getElementById('lastUpdate').textContent = 'Erro ao carregar';
  }
}

document.getElementById('refresh').addEventListener('click', (e)=>{e.preventDefault(); fetchThingSpeak();});
document.getElementById('about').addEventListener('click', (e)=>{e.preventDefault(); alert('EcoThinkers · FieldTrack — Demo estático. Engenharia da Computação - FIAP');});

// Demo "chat" behavior: simple canned replies to show interactivity (no API key exposed)
document.getElementById('sendMsg').addEventListener('click', ()=>{
  const input = document.getElementById('userMsg');
  const value = input.value.trim();
  if(!value) return;
  const box = document.getElementById('chatBox');
  const u = document.createElement('div'); u.className='user'; u.textContent = 'Você: ' + value; box.appendChild(u);
  // very simple heuristic replies to simulate a smart assistant
  let reply = 'Desculpe, não tenho conexão com o GPT nesta demo. Para habilitar chat real, hospede um backend com sua chave OpenAI.';
  if(/temperatur|temp/i.test(value)) reply = 'Pelo gráfico atual, a temperatura está na faixa de ' + (Math.round((Math.random()*5+18)*10)/10) + ' °C.';
  if(/umid|humidade/i.test(value)) reply = 'A umidade parece estar por volta de ' + (Math.round((Math.random()*10+35))) + ' %.';
  const g = document.createElement('div'); g.className='gpt'; g.textContent = 'GPT: ' + reply; box.appendChild(g);
  box.scrollTop = box.scrollHeight;
  input.value='';
});

// initial load
fetchThingSpeak();
// auto refresh every 20s
setInterval(fetchThingSpeak, 20000);
