import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  imports: [],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatar {
  nombre = input.required<string>();
  size = input<number>(40);

  private readonly colors = [
    'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-500'
  ];

  iniciales = computed(() => {
    const value = (this.nombre() || '').trim();
    if (!value) return '';
    const nombres = value.split(/\s+/).filter(Boolean);
    if (nombres.length === 1) {
      return nombres[0].slice(0, 2).toUpperCase();
    }
    const iniciales = nombres.map(n => n.charAt(0).toUpperCase()).join('');
    return iniciales.slice(0, 2); // Limitar a 2 caracteres
  })

  color = computed(() => {
    const charCodeSum = this.nombre().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return this.colors[charCodeSum % this.colors.length];
  });
}
