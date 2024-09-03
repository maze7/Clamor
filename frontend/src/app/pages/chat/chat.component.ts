import { Component } from '@angular/core';
import {LucideAngularModule} from "lucide-angular";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    LucideAngularModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

}
