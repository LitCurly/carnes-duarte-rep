import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";
import {Order, StatusEnum} from "../../../models/order";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ver-pedidos',
  templateUrl: './ver-pedidos.component.html',
  styleUrls: ['./ver-pedidos.component.css']
})
export class VerPedidosComponent implements OnInit {
  usersWithOrders: any[] = [];
  paginatedUsers: any[] = [];
  paginatedOrders: Order[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  searchQuery: string = '';
  selectedStatus: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      const querySearch = params['search'] || '';
      this.searchQuery = querySearch.trim() ? querySearch : '';
      this.selectedStatus = params['status'] || '';

      this.loadUsersWithOrders();
    });
  }

  loadUsersWithOrders(): void {
    this.usersWithOrders = [];
    this.userService.getUsers().subscribe(users => {
      const filteredUsers = users.filter(user => user.rol === 'usuario' || user.rol === 'administrador');
      const tempUsersWithOrders: any[] = [];

      let completedRequests = 0;

      filteredUsers.forEach(user => {
        this.userService.getOrdersByUser(user.id).subscribe(orders => {
          orders.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

          orders.forEach(order => {
            const existingOrder = tempUsersWithOrders.find(
              (item) => item.userId === user.id && item.order.id === order.id
            );

            if (!existingOrder) {
              tempUsersWithOrders.push({
                userId: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                direccion: user.direccion,
                order
              });
            }
          });

          completedRequests++;

          if (completedRequests === filteredUsers.length) {
            this.usersWithOrders = tempUsersWithOrders;

            let filteredResults = this.usersWithOrders.filter(user =>
              `${user.nombre} ${user.apellido}`.toLowerCase().includes(this.searchQuery.toLowerCase())
            );

            if (this.selectedStatus) {
              filteredResults = filteredResults.filter(user =>
                user.order.status === this.selectedStatus
              );
            }

            filteredResults.sort((a, b) => b.order.createdAt.toDate() - a.order.createdAt.toDate());

            this.totalPages = Math.ceil(filteredResults.length / this.itemsPerPage);
            this.paginatedUsers = this.paginate(filteredResults, this.currentPage, this.itemsPerPage);
          }
        });
      });
    });
  }

  paginate(array: any[], page: number, itemsPerPage: number): any[] {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedArray = array.slice(start, end);
    return paginatedArray;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateQueryParams(false, false);
      this.loadUsersWithOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateQueryParams(false, false);
      this.loadUsersWithOrders();
    }
  }

  updateQueryParams(includeStatus: boolean, removeStatus: boolean): void {
    const queryParams: any = {
      page: this.currentPage
    };

    if (this.searchQuery.trim()) {
      queryParams['search'] = this.searchQuery;
    }

    if (includeStatus && this.selectedStatus) {
      queryParams['status'] = this.selectedStatus;
    }

    if (removeStatus) {
      delete queryParams['status'];
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    let url = `/admin/home/revisar-pedidos?page=${this.currentPage}`;

    if (this.searchQuery.trim()) {
      url += `&search=${this.searchQuery}`;
    }

    this.router.navigateByUrl(url);
    this.loadUsersWithOrders();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    let url = `/admin/home/revisar-pedidos?page=${this.currentPage}`;


    if (this.selectedStatus.trim()) {
      url += `&status=${this.selectedStatus}`;
    }

    this.router.navigateByUrl(url);
    this.loadUsersWithOrders();
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  formatDate(dateTime: any): string {
    const date = dateTime instanceof Date ? dateTime : dateTime?.toDate();
    if (!date) return '';

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  formatAndCapitalizeDate(dateTime: any): string {
    const formattedDate = this.formatDate(dateTime);
    return this.capitalizeFirstLetter(formattedDate);
  }

  toggleOrderStatus(userOrder: any): void {
    const newStatus = userOrder.order.status === StatusEnum.Pendiente ? StatusEnum.Finalizada : StatusEnum.Pendiente;

    if (!userOrder.order.id || !userOrder.userId) {
      this.toastr.error('No se pudo actualizar el estado. Faltan datos necesarios.');
      return;
    }

    this.userService.updateOrderStatus(userOrder.userId, userOrder.order.id, newStatus).subscribe(
      () => {
        userOrder.order.status = newStatus;
        this.toastr.success('El estado de la orden se ha actualizado correctamente.');
      },
      error => {
        this.toastr.error('Ocurrió un error al actualizar el estado de la orden.');
      }
    );
  }
}
