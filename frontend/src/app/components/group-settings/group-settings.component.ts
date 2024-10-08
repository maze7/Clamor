import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {AsyncPipe, NgClass} from "@angular/common";
import {ChatComponent} from "../../pages/chat/chat.component";
import {PeopleComponent} from "../people/people.component";
import {GroupService} from "../../services/group.service";
import {User} from "../../models/user.model";
import {Group} from "../../models/group.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AddUserModalComponent} from "../add-user-modal/add-user-modal.component";
import {UserService} from "../../services/user.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Channel} from "../../models/channel.model";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [
    LucideAngularModule,
    AsyncPipe,
    ChatComponent,
    PeopleComponent,
    NgClass,
    AddUserModalComponent,
    ReactiveFormsModule
  ],
  templateUrl: './group-settings.component.html',
  styleUrl: './group-settings.component.css'
})
export class GroupSettingsComponent implements OnInit {

  protected tabs = ['General', 'Users'];
  protected currentTab: string = this.tabs[0];
  private destroyRef = inject(DestroyRef);
  groupForm: FormGroup;


  @Output() closed = new EventEmitter();

  protected users: User[] = [];

  constructor(protected groupService: GroupService, private userService: UserService, protected auth: AuthService, private fb: FormBuilder) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.userService.list({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.users = data;
    });

    // Load current group data and populate form
    this.groupService.currentGroup.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(group => {
      if (group) {
        this.groupForm.patchValue({
          name: group.name,
          acronym: group.acronym
        });
      }
    });
  }

  saveGroup(): void {
    if (this.groupForm.valid) {
      const group = this.groupService.currentGroup.value!;
      group.name = this.groupForm.get('name')!.value;
      group.acronym = this.groupForm.get('acronym')!.value;
      this.groupService.saveGroup(group).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  setTab(tab: string): void  {
    this.currentTab = tab;
  }

  kick(user: User): void {
    this.groupService.kick(user, undefined).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  ban(user: User, decision: boolean): void {
    this.groupService.ban(user, decision).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  accept(user: User, decision: boolean): void {
    const group = this.groupService.currentGroup.value!;
    this.groupService.accept(user, group, decision).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  setAdmin(user: User, status: boolean): void {
    const group = this.groupService.currentGroup.value!;
    this.groupService.setAdmin(user, group, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  delete(): void {
    this.groupService.deleteGroup(this.groupService.currentGroup.value!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closed.emit();  // Emit only after successful deletion
        },
        error: (err) => {
          console.error('Error deleting group:', err);
        }
      });
  }

  deleteChannel(channel: Channel): void {
    const group = this.groupService.currentGroup.value!;
    this.groupService.deleteChannel(group, channel._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
