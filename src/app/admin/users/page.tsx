"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  UserX,
  UserCheck,
  MoreVertical,
  Copy,
  Trash2,
  Send,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Mock data
const mockUsers = [
  {
    id: "1",
    email: "admin@company.com",
    name: "Jean Dupont",
    role: "ADMIN",
    status: "ACTIVE",
    image: null,
    createdAt: new Date("2024-01-15"),
    lastLoginAt: new Date("2025-01-11"),
  },
  {
    id: "2",
    email: "editor@company.com",
    name: "Marie Martin",
    role: "EDITOR",
    status: "ACTIVE",
    image: null,
    createdAt: new Date("2024-03-20"),
    lastLoginAt: new Date("2025-01-10"),
  },
  {
    id: "3",
    email: "viewer@company.com",
    name: "Pierre Durand",
    role: "VIEWER",
    status: "ACTIVE",
    image: null,
    createdAt: new Date("2024-06-01"),
    lastLoginAt: new Date("2025-01-08"),
  },
  {
    id: "4",
    email: "suspended@company.com",
    name: "Ancien Utilisateur",
    role: "VIEWER",
    status: "SUSPENDED",
    image: null,
    createdAt: new Date("2024-02-10"),
    lastLoginAt: new Date("2024-12-15"),
  },
]

const mockInvites = [
  {
    id: "1",
    email: "newuser@company.com",
    role: "EDITOR",
    expiresAt: new Date("2025-01-20"),
    createdAt: new Date("2025-01-10"),
    sentBy: "Jean Dupont",
  },
  {
    id: "2",
    email: "investor@external.com",
    role: "VIEWER",
    expiresAt: new Date("2025-01-25"),
    createdAt: new Date("2025-01-12"),
    sentBy: "Jean Dupont",
  },
]

const mockAllowedDomains = [
  { id: "1", domain: "company.com", role: "VIEWER", isActive: true },
  { id: "2", domain: "partner.com", role: "VIEWER", isActive: true },
]

function UserRow({ user }: { user: typeof mockUsers[0] }) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "EDITOR":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <Avatar>
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {user.name || user.email}
          </p>
          <Badge variant={getRoleBadgeVariant(user.role) as any} className="text-xs">
            {user.role}
          </Badge>
          {user.status === "SUSPENDED" && (
            <Badge variant="outline" className="text-xs text-red-600">
              Suspendu
            </Badge>
          )}
        </div>
        <p className="text-sm text-zinc-500 truncate">{user.email}</p>
      </div>
      <div className="hidden md:block text-right text-xs text-zinc-500">
        <p>Derniere connexion</p>
        <p>{format(user.lastLoginAt, "d MMM yyyy", { locale: fr })}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Shield className="mr-2 h-4 w-4" />
            Changer le role
          </DropdownMenuItem>
          {user.status === "ACTIVE" ? (
            <DropdownMenuItem className="text-amber-600">
              <UserX className="mr-2 h-4 w-4" />
              Suspendre
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="text-emerald-600">
              <UserCheck className="mr-2 h-4 w-4" />
              Reactiver
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Inviter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un utilisateur</DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email. L'utilisateur aura 7 jours pour creer son compte.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input id="email" type="email" placeholder="utilisateur@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select defaultValue="VIEWER">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer - Lecture seule</SelectItem>
                <SelectItem value="EDITOR">Editor - Peut editer</SelectItem>
                <SelectItem value="ADMIN">Admin - Acces complet</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              Viewer: peut consulter. Editor: peut creer et modifier. Admin: acces complet.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuler</Button>
          <Button>
            <Send className="mr-1 h-4 w-4" />
            Envoyer l'invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const [search, setSearch] = useState("")

  const activeUsers = mockUsers.filter((u) => u.status === "ACTIVE")
  const suspendedUsers = mockUsers.filter((u) => u.status === "SUSPENDED")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gerez les acces et les roles
          </p>
        </div>
        <InviteDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Users className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
                <p className="text-xs text-zinc-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeUsers.length}</p>
                <p className="text-xs text-zinc-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockInvites.length}</p>
                <p className="text-xs text-zinc-500">Invitations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAllowedDomains.length}</p>
                <p className="text-xs text-zinc-500">Domaines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs ({mockUsers.length})</TabsTrigger>
          <TabsTrigger value="invites">Invitations ({mockInvites.length})</TabsTrigger>
          <TabsTrigger value="domains">Domaines autorises</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3">
          {mockUsers.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="invites" className="space-y-3">
          {mockInvites.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Mail className="h-5 w-5 text-amber-500" />
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {invite.email}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Invite par {invite.sentBy} - Expire le {format(invite.expiresAt, "d MMM", { locale: fr })}
                  </p>
                </div>
                <Badge variant="secondary">{invite.role}</Badge>
                <Button variant="ghost" size="icon-sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Domaines autorises</CardTitle>
              <CardDescription>
                Les utilisateurs avec ces domaines email peuvent se connecter automatiquement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAllowedDomains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center gap-4 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                >
                  <div className="flex-1">
                    <p className="font-medium">@{domain.domain}</p>
                    <p className="text-xs text-zinc-500">
                      Role par defaut: {domain.role}
                    </p>
                  </div>
                  <Badge variant={domain.isActive ? "success" : "secondary"}>
                    {domain.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="mr-1 h-4 w-4" />
                Ajouter un domaine
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
