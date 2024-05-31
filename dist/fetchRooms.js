document.addEventListener('DOMContentLoaded', () => {
  const roomSection = document.getElementById('roomSection');
  const roomsContainer = document.getElementById('roomsContainer');

  const token = localStorage.getItem("token");

  const requestOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  fetch('http://127.0.0.1:8000/api/rooms/', requestOptions)
    .then(response => response.json())
    .then(data => {
      data.forEach(room => {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'bg-[#D8F2E4] p-4 rounded-lg';

        roomDiv.innerHTML = `
          <h2 class="text-2xl font-semibold mb-2 text-black">Chat</h2>
          <div class="pb-2">
            <div class="border-green-300 px-2">
              <p><strong>ID:</strong> ${room.room_id}</p>
              <p><strong>Name:</strong> ${room.user}</p>
              <p><strong>Status:</strong> ${room.status}</p>
              <p><strong>Agent:</strong> ${room.agent ? room.agent : 'None Yet...'}</p>
            </div>
            <div class="flex mt-4">
              <a href="./chat.html?room_id=${room.room_id}&userName=${room.user}" class="bg-[#285D46] text-white px-4 py-2 rounded-md mr-2">Join</a>
              <button class="bg-[#E3343F] text-white px-4 py-2 rounded-md">Delete</button>
            </div>
          </div>
        `;

        roomsContainer.appendChild(roomDiv);
      });

      // Unhide the room section after populating it
      roomSection.classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error fetching rooms:', error);
    });
});