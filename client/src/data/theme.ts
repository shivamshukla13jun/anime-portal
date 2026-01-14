import { createTheme } from '@mui/material';
export const Colors = {
  palette: {
    primary: {
      main: '#dd5d2c', // $primary from _variables
      light: '#e47a51', // $primary-light (lighten by 10%)
      dark: '#0d1442', // $primary-dark
    },
    secondary: {
      main: '#64748b', // $secondary
      light: '#94a3b8', // $gray-400
      dark: '#475569', // $text-secondary
    },
    error: {
      main: '#dc3545', // $danger
    },
    warning: {
      main: '#f59e0b', // $warning
    },
    info: {
      main: '#0ea5e9', // $info
    },
    success: {
      main: '#22c55e', // $success
    },
    text: {
      primary: '#000000', // $text-primary
      secondary: '#475569', // $text-secondary
    },
    background: {
      default: '#f8f9fa', // $gray-50
      paper: '#ffffff', // $white
    },
    divider: '#E5E8EC', // Default divider color (light gray)
  },
     PartiallyPaid:"#ffc107",
     Paid:"#8bc34a",
     Overdue:"#e53935",
     Pending:"#ffc107",
     Delivered:"#8bc34a",
     Cancelled:"#e53935",
     InProgress:"#64b5f6",
     Dispatched:"#4caf50",
     PickedUp:"#4582ec",
     Claimed:"#d50000",
     ClaimedDelivered:"#cc1619",
     loadNumber:"#4582ec",
     loadAmount:"#4582ec",
     customeramt:"#4582ec",
     carrieramt:"#4582ec",
     carriermarginamt:"#4582ec",
     status:"#4582ec",
     invoice:"#4582ec",
     customer:"#b14749",
     repair:"#885824",
     picks:"#4582ec",
     pickDate:"#4582ec",
     currentLocation:"#4582ec",
     drops:"#4582ec",
     dropDate:"#4582ec",
     carrier:"#2f8280",
     driver:"#4582ec",
     equipment:"#4582ec",
     powerUnit:"#4582ec",
     trailer:"#4582ec",
     createdBy:"#4582ec",
     equipmentType:"#4582ec",
     Partial:"#4582ec",
     Full:"#4582ec",
     Van:"#4582ec",
     Reefer:"#4582ec",
     VanAirRide:"#4582ec",
     VanHazardous:"#4582ec",
     VanVented:"#4582ec",
     VanCurtains:"#4582ec",
     VanPalletExchange:"#4582ec",
     ReeferHazardous:"#4582ec",
     ReeferPalletExchange:"#4582ec",
     DoubleDrop:"#4582ec",
     Flatbed:"#4582ec",
     FlatbedHazardous:"#4582ec",
     FlatbedPalletExchange:"#4582ec",
     FlatbedSides:"#4582ec",
     Lowboy:"#4582ec",
     Maxi:"#4582ec",
     RemovableGooseneck:"#4582ec",
     StepDeck:"#4582ec",
     AutoCarrier:"#4582ec",
     DumpTrailer:"#4582ec",
     HopperBottom:"#4582ec",
     Hotshot:"#4582ec",
     Tanker:"#4582ec",
     FlatbedStepDeck:"#4582ec",
     FlatbedVan:"#4582ec",
     FlatbedReefer:"#4582ec",
     ReeferVan:"#4582ec",
     FlatbedReeferVan:"#4582ec",
     PowerOnly:"#4582ec",
     unknown:"#e47a51"
}
// Create a theme instance using colors from _variables
const theme = createTheme({
    palette: Colors.palette,
    typography: {
      fontFamily: '"Lexend Deca", serif', // From body in index
      fontSize: 14,
      h1: {
        fontFamily: '"Poppins", sans-serif', // From h1-h4 in index
        fontWeight: 700, // $font-weight-bold
      },
      h2: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500, // $font-weight-medium
      },
    },
    shape: {
      borderRadius: 8, // $border-radius (0.5rem = 8px)
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6, // $border-radius-md (0.375rem = 6px)
            padding: '12px 20px', // From .button-style-one
            transition: 'all 0.2s ease', // $transition-base
            '&:hover': {
              transform: 'translateY(-1px)', // From .button-style-one:hover
            },
            '&:active': {
              transform: 'translateY(0)', // From .button-style-one:active
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 8, // From .form-control
            '&.Mui-focused': {
              // boxShadow: '0 0 0 0.2rem rgba(221, 93, 44, 0.25)', // From .form-control:focus
            },
          },
          input: {
            height: '1.4375em', // Ensure consistent height for all inputs
            '&[type=number]': {
              height: '1.4375em', // Explicitly set height for number inputs
              padding: '16.5px 14px', // Match the padding of text inputs
              '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                margin: 0,
                WebkitAppearance: 'none'
              },
              MozAppearance: 'textfield' // Firefox
            }
          }
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#dd5d2c', // $primary
            },
            // Ensure input height consistency
            input: {
              height: '1.4375em',
              boxSizing: 'content-box'
            }
          },
          // Ensure number inputs have the same height
          input: {
            '&[type=number]': {
              height: '1.4375em'
            }
          }
        },
      },
      // Ensure Select components have the same height as inputs
      MuiSelect: {
        styleOverrides: {
          select: {
            minHeight: '1.4375em',
            lineHeight: '1.4375em'
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'var(--divider-color, #E5E8EC)',
            '&.custom-divider': {
              borderColor: 'var(--custom-divider-color, #DD5D2C)',
            }
          },
        },
      },
    },
  });

export default theme;