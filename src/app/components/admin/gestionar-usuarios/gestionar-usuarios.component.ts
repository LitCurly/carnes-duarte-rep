import { Component, OnInit } from '@angular/core'
import { UserService } from '../../../services/user.service'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../../../services/auth-service.service'
import { ToastrService } from 'ngx-toastr'

@Component({
  selector: 'app-gestionar-usuarios',
  templateUrl: './gestionar-usuarios.component.html',
  styleUrls: ['./gestionar-usuarios.component.css'],
})
export class GestionarUsuariosComponent implements OnInit {
  users: any[] = []
  paginatedUsers: any[] = []
  currentPage = 1
  itemsPerPage = 10
  totalPages = 1
  searchQuery: string = ''

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1
      const querySearch = params['search'] || ''
      this.searchQuery = querySearch.trim() ? querySearch : ''

      this.loadUsers()
    })
  }

  formatRutUserData(rut: string): string {
    if (!rut) return ''
    rut = rut.replace(/\D/g, '')
    const rutFormateado = `${rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${rut.slice(-1)}`
    return rutFormateado
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      // Filter users based on role
      const filteredUsers = users.filter((user) => user.rol === 'usuario' || user.rol === 'administrador')

      // Apply search query filter
      let searchResults = filteredUsers.filter((user) =>
        `${user.nombre} ${user.apellido}`.toLowerCase().includes(this.searchQuery.toLowerCase())
      )

      this.totalPages = Math.ceil(searchResults.length / this.itemsPerPage)
      this.paginatedUsers = this.paginate(searchResults, this.currentPage, this.itemsPerPage)
    })
  }

  paginate(array: any[], page: number, perPage: number): any[] {
    return array.slice((page - 1) * perPage, page * perPage)
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.updateQueryParams()
      this.loadUsers()
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.updateQueryParams()
      this.loadUsers()
    }
  }

  updateQueryParams(): void {
    const queryParams: any = {
      page: this.currentPage,
    }

    if (this.searchQuery.trim()) {
      queryParams['search'] = this.searchQuery
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    })
  }

  onSearch(): void {
    this.currentPage = 1
    this.updateQueryParams()
    this.loadUsers()
  }

  toggleAdmin(user: any): void {
    const newRole = user.rol === 'administrador' ? 'usuario' : 'administrador'
    this.userService.updateUserRole(user.id, newRole).subscribe(
      () => {
        user.rol = newRole
        this.toastr.success('El rol del usuario ha sido actualizado', 'Éxito')

        const currentUser = this.authService.getCurrentUser()
        if (currentUser && currentUser.uid === user.id && currentUser.email) {
          // Verificar si el usuario autenticado pierde el rol de administrador
          this.authService.getUserRole().then((role) => {
            if (role !== 'administrador') {
              this.authService.logout() // Redirigir al login si pierde el rol
            }
          })
        }
      },
      (error) => {
        this.toastr.error('Hubo un error al actualizar el rol del usuario', 'Error')
      }
    )
  }
}
