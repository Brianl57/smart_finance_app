import { Calendar, Home, Inbox, Search, Settings, CreditCard, DollarSign, PieChart } from "lucide-react"
import { LogoutButton } from "./logout-button"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Accounts",
        url: "/dashboard/accounts",
        icon: CreditCard,
    },
    // {
    //     title: "Cashflow",
    //     url: "/dashboard/cashflow",
    //     icon: DollarSign,
    // },
    {
        title: "Transactions",
        url: "/dashboard/transactions",
        icon: PieChart, // Or CreditCard if preferred, but CreditCard is used for Accounts. Using PieChart or List. User requested "Transactions" specifically. 
        // Let's use List or similar if available, otherwise PieChart as per my plan or maybe 'FileText'.
        // The plan said PieChart or CreditCard or List. 
        // Let's stick to what I wrote: PieChart is already imported? Yes.
    },
    // {
    //     title: "Settings",
    //     url: "/dashboard/settings",
    //     icon: Settings,
    // },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Smart Finance</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <LogoutButton />
            </SidebarFooter>
        </Sidebar>
    )
}
