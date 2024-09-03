import { Injectable } from '@angular/core';
import {Group} from "../models/group.model";
import {Channel} from "../models/channel.model";
import {BehaviorSubject} from "rxjs";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private auth: AuthService) { }

  public currentGroup: BehaviorSubject<Group | null> = new BehaviorSubject<Group | null>(null);
  public currentChannel: BehaviorSubject<Channel | null> = new BehaviorSubject<Channel | null>(null);
  public group$ = this.currentGroup.asObservable();
  public channel$ = this.currentChannel.asObservable();

  // dummy data for now
  private groups: Group[] = [
    {
      id: '1',
      name: 'Group 1',
      acronym: 'G1',
      members: [
        { username: 'Nathan Wilson', email: 'nathan@nathan.com', id: '0', avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp' },
        { username: 'Tara Templeman', email: 'tara@tara.com', id: '0' },
      ],
      admins: [
        { username: 'Callan Acton', email: 'callan@callan.com', id: '0', avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp' },
        { username: 'asdf', email: 'asdf@asdf.com', id: '66d70283e962443778155247', avatar: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp' },
      ],
      pendingAdmins: [],
      pendingMembers: [
        { username: 'Shrek', email: 'shrek@his.swamp', id: '0', avatar: 'https://www.cnet.com/a/img/resize/4cd1618a335631f7c0b7caa5fdc421b024f20f06/hub/2018/11/30/5ccd3953-6edf-4435-b4d1-615d3d0274b1/shrekretoldstill.jpg?auto=webp&width=1920' },
      ],
      channels: [
        { id: '1', name: 'memes' },
      ]
    },
    {
      id: '2',
      name: 'Group Two',
      acronym: 'G2',
      members: [],
      admins: [],
      pendingAdmins: [],
      pendingMembers: [],
      channels: []
    },
  ];

  /**
   * Gets a list of all groups that exist within the server
   */
  listGroups(): Group[] {
    return this.groups;
  }

  /**
   * Navigates to the designated group
   * @param groupId id of group to be navigated to
   */
  setGroup(groupId: string | null): void {
    this.currentGroup.next(this.groups.find(g => g.id === groupId) ?? null);

    if (groupId) {
      // update the current channel if the group has channels
      if (this.currentGroup.value!.channels.length > 0) {
        this.currentChannel.next(this.currentGroup.value!.channels[0]);
      }
    }
  }

  /**
   * Creates a group (if the user has the correct permissions)
   * @param group the Group to be created
   */
  createGroup(group: Group): void {
    // temporarily assign a fake id here (this will be assigned by DB later)
    group.id = (this.groups.length + 1).toString();

    this.groups.push(group);
    this.setGroup(group.id);
  }

  /**
   * Creates a new channel within the current group
   * @param channel
   */
  createChannel(name: string): void {
    // this is placeholder while there is no API to call
    const group = this.currentGroup.value;

    // if there is a currently selected group, add the channel & update behaviour subject
    if (group) {
      const id = (group.channels.length + 1).toString(); // this will be a MongoDB document ID
      group.channels.push({ id, name });
      this.currentGroup.next(group);
    }
  }

  /**
   * Navigate to a specific channel within the current group
   * @param channelId id of channel to navigate to
   */
  setChannel(channelId: string | null): void {
    const channel = this.currentGroup.value?.channels.find(c => c.id === channelId);
    if (channel) {
      this.currentChannel.next(channel);
    }
  }

  /**
   * Utility method to determine if a user has access to the current group based on their role and group membership
   */
  hasAccess(): boolean {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    return user.roles.includes('superAdmin') || group?.members.find(u => u.id == user.id) || group?.admins.find(u => u.id == user.id);
  }

  /**
   * Utility method to determine if a user has requested to join a group
   */
  hasRequestedAccess(): boolean {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    return group?.pendingMembers.includes(user.id) ?? false;
  }

  /**
   * Utility method to request access to a group
   */
  requestAccess(): void {
    const group = this.currentGroup.value;
    const user = this.auth.getUser();

    group?.pendingMembers.push(user.id);
  }
}
