let draggedTask: HTMLDivElement | null = null;

// Função para criar elemento de tarefa (precisa estar fora do DOMContentLoaded para reutilização)
function createTaskElement(text: string): HTMLDivElement {
  const task = document.createElement('div');
  task.className = 'task';
  task.setAttribute('draggable', 'true');

  // Criar conteúdo e botão excluir
  const span = document.createElement('span');
  span.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.className = 'delete-btn';
  deleteBtn.title = 'Excluir tarefa';

  deleteBtn.addEventListener('click', () => {
    task.remove();
    salvarTarefas();
  });

  // Montar card
  task.appendChild(span);
  task.appendChild(deleteBtn);

  // Eventos de drag
  task.addEventListener('dragstart', (e: DragEvent) => {
    draggedTask = task;
    task.classList.add('dragging');
    e.dataTransfer?.setData('text/plain', '');
  });

  task.addEventListener('dragend', () => {
    draggedTask = null;
    task.classList.remove('dragging');
  });

  return task;
}

// Função para salvar tarefas no localStorage
function salvarTarefas(): void {
  const dados: Record<string, string[]> = {
    todo: [],
    doing: [],
    done: []
  };

  Object.keys(dados).forEach((status) => {
    const coluna = document.getElementById(status) as HTMLDivElement;
    const tarefas = Array.from(coluna.children) as HTMLDivElement[];
    dados[status] = tarefas.map(t => {
      const span = t.querySelector('span');
      return span?.textContent || '';
    });
  });

  localStorage.setItem('kanbanTarefas', JSON.stringify(dados));
}
// Função para restaurar tarefas do localStorage
function restaurarTarefas(): void {
  const dadosSalvos = localStorage.getItem('kanbanTarefas');
  if (!dadosSalvos) return;

  const dados = JSON.parse(dadosSalvos) as Record<string, string[]>;

  Object.entries(dados).forEach(([status, tarefas]) => {
    const coluna = document.getElementById(status) as HTMLDivElement;
    tarefas.forEach((texto) => {
      const nova = createTaskElement(texto);
      coluna.appendChild(nova);
    });
  });
}

// Lógica principal
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleTheme') as HTMLButtonElement;
  const addTaskBtn = document.getElementById('addTaskBtn') as HTMLButtonElement;
  const taskInput = document.getElementById('taskInput') as HTMLInputElement;
  const todoColumn = document.getElementById('todo') as HTMLDivElement;
  const columns = document.querySelectorAll('.task-list') as NodeListOf<HTMLDivElement>;
  const body = document.body;
  // Restaurar tema salvo
  const temaSalvo = localStorage.getItem('temaPreferido');
  if (temaSalvo === 'claro') {
    body.classList.add('light-theme');
    toggleBtn.textContent = '🌞 Alternar Tema';
  } else {
    toggleBtn.textContent = '🌙 Alternar Tema';
  }

  // Alternar tema claro/escuro
  toggleBtn?.addEventListener('click', () => {
  body.classList.toggle('light-theme');
  const isLight = body.classList.contains('light-theme');

  // Altera ícone e salva no localStorage
  toggleBtn.textContent = isLight ? '🌞 Alternar Tema' : '🌙 Alternar Tema';
  localStorage.setItem('temaPreferido', isLight ? 'claro' : 'escuro');
  });

  // Adicionar tarefa ao clicar no botão
  addTaskBtn?.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const newTask = createTaskElement(taskText);
    todoColumn.prepend(newTask);

    newTask.animate([
      { opacity: 0, transform: 'translateY(-10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });

    taskInput.value = '';
    salvarTarefas();
  });

  // Adicionar tarefa com Enter
  taskInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTaskBtn.click();
    }
  });

  // Habilitar drag and drop nas colunas
  columns.forEach(column => {
    column.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
    });

    column.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (draggedTask) {
        const target = e.currentTarget as HTMLElement;
        target.appendChild(draggedTask);
        salvarTarefas();
      }
    });
  });

  // Restaurar tarefas salvas ao carregar
  restaurarTarefas();
});